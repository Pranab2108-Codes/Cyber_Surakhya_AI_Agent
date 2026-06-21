import sys
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from app.config import settings

# Active database instance references
db = None
sessions_collection = None
reports_collection = None

# Graceful in-memory fallback dictionary if MongoDB is offline / not installed
_memory_sessions = {}
_memory_reports = {}

class InMemoryCollectionFallback:
    """
    A lightweight mock collection mirroring PyMongo interface for basic local testing
    when a live MongoDB instance is not connected.
    """
    def __init__(self, storage):
        self._storage = storage

    def find(self, filter=None, *args, **kwargs):
        if filter is None:
            return list(self._storage.values())
        results = []
        for doc in self._storage.values():
            match = True
            for k, v in filter.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                results.append(doc)
        return results

    def find_one(self, filter, *args, **kwargs):
        results = self.find(filter)
        return results[0] if results else None

    def update_one(self, filter, update, upsert=False):
        key = filter.get("session_id")
        data = update.get("$set", {})
        if key not in self._storage:
            if upsert:
                self._storage[key] = {"session_id": key}
            else:
                return None
        
        # Implement safe dictionary merging
        for k, v in data.items():
            self._storage[key][k] = v

    def insert_one(self, document):
        key = document.get("session_id") or document.get("report_id") or str(len(self._storage) + 1)
        self._storage[key] = document
        return type('obj', (object,), {'inserted_id': key})()

    def delete_one(self, filter):
        key = filter.get("session_id")
        if key in self._storage:
            del self._storage[key]


# Initialize MongoDB Connection
try:
    print(f"Connecting to MongoDB at: {settings.MONGO_URI}...")
    client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=2000)
    
    # Trigger a call to verify connection status
    client.server_info()
    
    # Reference collections
    db = client["cyber_suraksha"]
    sessions_collection = db["chat_sessions"]
    reports_collection = db["fraud_reports"]
    print("Successfully connected to MongoDB.")
    
except (ConnectionFailure, Exception) as e:
    print(f"\nWARNING: Could not connect to MongoDB: {e}", file=sys.stderr)
    print("Falling back to absolute safe in-memory session database for local debugging.\n", file=sys.stderr)
    
    # Fallback to local in-memory dictionaries mimicking pymongo
    db = None
    sessions_collection = InMemoryCollectionFallback(_memory_sessions)
    reports_collection = InMemoryCollectionFallback(_memory_reports)
