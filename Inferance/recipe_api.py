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