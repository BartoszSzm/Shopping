import os

import dotenv

# Ensure dotenv is loaded (will not be loaded if using interactive session or Jupyter)
env_path = os.path.dirname(os.path.dirname(__file__)) + "/.env"
if os.path.isfile(env_path):
    dotenv.load_dotenv(env_path, override=True)
else:
    raise EnvironmentError("Cannot load env file", env_path)

from .app import app
