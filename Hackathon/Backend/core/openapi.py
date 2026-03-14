from fastapi.openapi.utils import get_openapi
from fastapi import FastAPI

def setup_openapi(app: FastAPI):
    def custom_openapi():
        if app.openapi_schema:
            return app.openapi_schema
        
        openapi_schema = get_openapi(
            title=app.title,
            version="1.0.0",
            description="Enterprise Hackathon API with JWT Security & Rate Limiting",
            routes=app.routes,
        )
        
        # Custom tagging logic for v1 routes
        for path, path_item in openapi_schema.get("paths", {}).items():
            if "/v1/generic/" in path:
                for method in path_item.keys():
                    path_item[method]["tags"] = ["v1 Generic CRUD"]
                    
        app.openapi_schema = openapi_schema
        return app.openapi_schema

    app.openapi = custom_openapi
