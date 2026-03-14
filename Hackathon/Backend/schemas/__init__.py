from schemas.user_schema import UserCreate, UserResponse, LoginRequest, Token

SCHEMA_REGISTRY = {
    "user": {
        "create": UserCreate,
        "response": UserResponse,
    }
}
