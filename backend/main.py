from fastapi import FastAPI

app = FastAPI(title="Lekhak")


@app.get("/")
def hello_world():
    return {"message": "Hello, World"}
