"""
Modal deployment script for Indian Recipe LLM API.
Deploys the fine-tuned model as a web endpoint.
"""
import modal
from typing import List, Optional
from pydantic import BaseModel

# Define Modal app
app = modal.App("indian-recipe-llm-api")

# Volume with trained model
volume = modal.Volume.from_name("recipe-model-vol", create_if_missing=True)

# Define the container image
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "numpy<2.0",  # Pin to 1.x to avoid compatibility issues
        "pyarrow==14.0.1",
    )
    .pip_install(
        "torch==2.1.2",
        "transformers==4.45.0",  # Updated to support Llama 3.2
        "peft==0.13.0",
        "bitsandbytes==0.44.1",
        "accelerate==0.34.0",
        "sentencepiece",
        "protobuf",
        "fastapi[standard]",  # Required for web endpoints
    )
)

VOLUME_PATH = "/vol"
MODEL_PATH = f"{VOLUME_PATH}/llama-recipe-model"


# Request/Response models
class RecipeRequest(BaseModel):
    ingredients: List[str]
    cuisine: str = "Indian"
    mealType: str = "lunch"
    diet: Optional[str] = "veg"


class RecipeResponse(BaseModel):
    recipeName: str
    steps: List[str]
    calories: str


class RecipeListResponse(BaseModel):
    recipes: List[RecipeResponse]
    totalRecipes: int


@app.cls(
    image=image,
    gpu="A10G",
    volumes={VOLUME_PATH: volume},
    # No secrets needed - using open model NousResearch/Llama-3.2-1B
    scaledown_window=300,  # Keep warm for 5 minutes (renamed from container_idle_timeout)
)
class RecipeGenerator:
    """Recipe generation model class."""
    
    @modal.enter()
    def load_model(self):
        """Load model on container startup."""
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
        from peft import PeftModel
        
        print("Loading model and tokenizer...")
        
        # Configure 4-bit quantization
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_use_double_quant=True,
        )
        
        # Load base model
        base_model = "NousResearch/Llama-3.2-1B"
        self.tokenizer = AutoTokenizer.from_pretrained(base_model)
        self.tokenizer.pad_token = self.tokenizer.eos_token
        
        # Load base model in 4-bit
        model = AutoModelForCausalLM.from_pretrained(
            base_model,
            quantization_config=bnb_config,
            device_map="auto",
            trust_remote_code=True,
        )
        
        # Load LoRA adapters
        print(f"Loading LoRA adapters from {MODEL_PATH}...")
        self.model = PeftModel.from_pretrained(model, MODEL_PATH)
        self.model.eval()
        
        print("Model loaded successfully!")
    
    @modal.method()
    def generate_recipes(self, request: RecipeRequest, num_recipes: int = 3) -> RecipeListResponse:
        """Generate multiple recipe suggestions based on ingredients and preferences."""
        import torch
        
        recipes = []
        ingredients_str = ", ".join(request.ingredients)
        
        # Generate multiple recipes with LOWER temperatures to reduce hallucinations
        temperatures = [0.5, 0.6, 0.7][:num_recipes]  # Much more conservative
        
        for i, temp in enumerate(temperatures):
            # Create prompt with strict instructions and format
            prompt = f"""### Instruction:
You are an Indian recipe expert. Given ingredients: {ingredients_str}, cuisine: {request.cuisine}, mealType: {request.mealType}, diet: {request.diet}, suggest an authentic Indian recipe.

CRITICAL CONSTRAINTS:
1. Use ONLY the ingredients provided: {ingredients_str}
2. Do NOT suggest any additional ingredients beyond those listed
3. Do NOT mention ingredients the user doesn't have
4. If you need basic spices (salt, oil), you can assume they are available
5. Create recipes that work with ONLY these ingredients

RECIPE FORMAT RULES:
1. Generate ONLY authentic Indian recipes
2. Recipe must match the specified cuisine and meal type
3. Follow EXACTLY this format:
   Recipe Name: [Name]
   Steps:
   1. [First step]
   2. [Second step]
   ...
   Calories: [number] calories
4. Keep recipe steps between 5-8 steps
5. Use only Indian cooking methods and spices
6. Do NOT add extra text after "Calories:"

### Response:
Recipe Name:"""
            
            # Tokenize
            inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
            
            # Generate with stricter parameters to stay close to training data
            with torch.no_grad():
                # Define stop strings to prevent hallucinations
                stop_strings = ["###", "Calorie ratio", "WARNING", "MEAL_TYPE", "Cuisine:", 
                               "diet:", "Note:", "Tip:", "Serving:", "Variation:"]
                
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=180,  # Reduced even more
                    temperature=temp,
                    top_p=0.75,  # Very conservative
                    top_k=30,  # Very restrictive
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id,
                    eos_token_id=self.tokenizer.eos_token_id,
                    repetition_penalty=1.3,  # Very strong penalty
                    no_repeat_ngram_size=4,  # Larger n-gram check
                    num_return_sequences=1,
                )
            
            # Decode
            generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Extract response part (everything after "### Response:")
            if "### Response:" in generated_text:
                response_text = generated_text.split("### Response:")[-1].strip()
            else:
                response_text = generated_text.strip()
            
            # Add "Recipe Name:" prefix if missing (we added it in prompt)
            if not response_text.startswith("Recipe Name:"):
                response_text = "Recipe Name: " + response_text
            
            # Parse response
            recipe = self._parse_response(response_text)
            recipes.append(recipe)
        
        return RecipeListResponse(
            recipes=recipes,
            totalRecipes=len(recipes)
        )
    
    def _parse_response(self, response_text: str) -> RecipeResponse:
        """Parse the generated text into structured response with VERY strict validation."""
        import re
        
        lines = response_text.strip().split('\n')
        
        recipe_name = ""
        steps = []
        calories = "450"  # Default
        
        # Hallucination keywords that should stop parsing immediately
        hallucination_keywords = [
            'warning', 'calorie ratio', 'calories from', '% calories', 'percent calories',
            'caloric', 'calorific', 'meal_type', 'cuisine:', 'diet:', '###', 'meal plan',
            'calculated', 'rating:', 'content:', 'calibration:', 'percentage:', 'total',
            'calculate', 'comment=', 'comment:', 'information:', 'density:', 'per calorie',
            'based on', 'adjust for', 'chicken', 'meat', 'fish'  # Reject non-veg if user wants veg
        ]
        
        in_steps = False
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # HARD STOP if we detect hallucination patterns
            line_lower = line.lower()
            if any(keyword in line_lower for keyword in hallucination_keywords):
                break
            
            # Stop if we see common metadata patterns
            if any(x in line_lower for x in ['### instruction', 'note:', 'tip:', 'variation:', 'serving suggestion']):
                break
            
            if line.startswith("Recipe Name:"):
                recipe_name = line.replace("Recipe Name:", "").strip()
                # Clean up: stop at first comma, parenthesis, or extra symbols
                for delimiter in [',', '(', ':', ';', ' -']:
                    if delimiter in recipe_name:
                        parts = recipe_name.split(delimiter)
                        if len(parts[0]) > 3:
                            break
                recipe_name = recipe_name.rstrip('.,;:!')
                
            elif line.startswith("Steps:"):
                in_steps = True
                
            elif line.startswith("Calories:"):
                # Extract just the number
                cal_text = line.replace("Calories:", "").replace("calories", "").strip()
                
                # Stop at comma
                if ',' in cal_text:
                    cal_text = cal_text.split(',')[0].strip()
                
                # Extract only first number found
                cal_match = re.search(r'(\d+)', cal_text)
                if cal_match:
                    calories = cal_match.group(1)
                else:
                    calories = "450"
                    
                in_steps = False
                break  # HARD STOP after calories
                
            elif in_steps and line:
                # Remove weird symbols: ). ] [ } etc.
                step = re.sub(r'^[\)\]\}\>]+\s*', '', line)  # Remove leading ), ], }, >
                step = step.lstrip("0123456789. -").strip()
                
                # STRICT validation for valid cooking steps
                if step and len(step) > 10 and len(step) < 150:
                    # Check if it looks like a real cooking instruction
                    cooking_verbs = ['add', 'mix', 'cook', 'boil', 'fry', 'heat', 'stir', 
                                    'sauté', 'simmer', 'chop', 'cut', 'prepare', 'season',
                                    'serve', 'garnish', 'blend', 'roast', 'grill', 'steam']
                    
                    # Must start with a cooking verb or reasonable instruction
                    step_lower = step.lower()
                    is_valid_step = any(verb in step_lower[:30] for verb in cooking_verbs)
                    
                    # Reject if it contains hallucination patterns
                    has_hallucination = any(keyword in step_lower for keyword in hallucination_keywords)
                    
                    # Reject if it has weird formatting
                    has_weird_format = any(char in step[:5] for char in [')', ']', '}', '#', '%', ':'])
                    
                    if is_valid_step and not has_hallucination and not has_weird_format:
                        steps.append(step)
                    
                # Stop after 8 steps maximum
                if len(steps) >= 8:
                    break
        
        # Validation and fallbacks
        if not recipe_name or len(recipe_name) < 3:
            recipe_name = "Indian Recipe (Generated)"
            
        if not steps or len(steps) < 2:
            steps = [
                "Recipe details could not be generated properly.",
                "Please try again with different ingredients or settings."
            ]
        
        # Ensure calories is a valid number
        try:
            cal_num = int(calories)
            if cal_num < 50 or cal_num > 2000:  # Sanity check
                calories = "450"
        except:
            calories = "450"
        
        return RecipeResponse(
            recipeName=recipe_name,
            steps=steps[:8],  # Limit to max 8 steps as per training data
            calories=calories
        )


@app.function(image=image)
@modal.asgi_app()
def fastapi_app():
    """Create FastAPI app with multiple routes."""
    from fastapi import FastAPI
    
    web_app = FastAPI(title="Indian Recipe LLM API")
    
    @web_app.post("/generate-recipe")
    async def generate_recipe_route(request: RecipeRequest):
        """Generate multiple recipe suggestions based on ingredients."""
        generator = RecipeGenerator()
        response = generator.generate_recipes.remote(request, num_recipes=3)
        return response
    
    @web_app.get("/health-check")
    async def health_check_route():
        """Health check endpoint."""
        return {"status": "healthy", "service": "Indian Recipe LLM API"}
    
    @web_app.get("/")
    async def root():
        """Root endpoint with API info."""
        return {
            "service": "Indian Recipe LLM API",
            "version": "1.0",
            "endpoints": {
                "generate_recipe": "POST /generate-recipe",
                "health_check": "GET /health-check"
            }
        }
    
    return web_app


@app.local_entrypoint()
def main():
    """Test the deployment locally."""
    print("Testing recipe generation...")
    
    # Create test request
    test_request = RecipeRequest(
        ingredients=["potato", "tomato", "onion", "cabbage"],
        cuisine="Indian",
        mealType="Dinner",
        diet="veg"
    )
    
    # Test generation
    generator = RecipeGenerator()
    response = generator.generate_recipe.remote(test_request)
    
    print("\n" + "="*80)
    print("Test Recipe Generated:")
    print("="*80)
    print(f"Recipe Name: {response.recipeName}")
    print(f"\nSteps:")
    for i, step in enumerate(response.steps, 1):
        print(f"{i}. {step}")
    print(f"\nCalories: {response.calories}")
    print("="*80)


if _name_ == "_main_":
    main()