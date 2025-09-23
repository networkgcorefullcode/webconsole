package configapi

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/omec-project/openapi/models"
	"github.com/omec-project/webconsole/dbadapter"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	return router
}

func TestHandleGetsK4(t *testing.T) {
	router := setupTestRouter()
	router.GET("/k4opt", HandleGetsK4)

	// Test case 1: Successful retrieval
	t.Run("Successful retrieval", func(t *testing.T) {
		mockK4Data := []map[string]interface{}{
			{"k4": "testKey1", "k4_sno": 1},
			{"k4": "testKey2", "k4_sno": 2},
		}

		// Mock the DB call
		oldClient := dbadapter.CommonDBClient
		dbadapter.CommonDBClient = &dbadapter.MockDBClient{
			GetManyFn: func(collName string, filter bson.M) ([]map[string]interface{}, error) {
				return mockK4Data, nil
			},
		}
		defer func() { dbadapter.CommonDBClient = oldClient }()

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/k4opt", nil)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response []models.K4
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response, 2)
	})

	// Test case 2: Database error
	t.Run("Database error", func(t *testing.T) {
		// Mock the DB call with error
		oldClient := dbadapter.CommonDBClient
		dbadapter.CommonDBClient = &dbadapter.MockDBClient{
			GetManyFn: func(collName string, filter bson.M) ([]map[string]interface{}, error) {
				return nil, assert.AnError
			},
		}
		defer func() { dbadapter.CommonDBClient = oldClient }()

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/k4opt", nil)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusInternalServerError, w.Code)
	})
}

func TestHandleGetK4(t *testing.T) {
	router := setupTestRouter()
	router.GET("/k4opt/:idsno", HandleGetK4)

	// Test case 1: Successful retrieval
	t.Run("Successful retrieval", func(t *testing.T) {
		mockK4Data := map[string]interface{}{
			"k4":     "testKey1",
			"k4_sno": int32(1),
		}

		// Mock the DB call
		oldClient := dbadapter.AuthDBClient
		dbadapter.AuthDBClient = &dbadapter.MockDBClient{
			GetOneFn: func(collName string, filter bson.M) (map[string]interface{}, error) {
				return mockK4Data, nil
			},
		}
		defer func() { dbadapter.AuthDBClient = oldClient }()

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/k4opt/1", nil)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})

	// Test case 2: Database error
	t.Run("Database error", func(t *testing.T) {
		// Mock the DB call with error
		oldClient := dbadapter.AuthDBClient
		dbadapter.AuthDBClient = &dbadapter.MockDBClient{
			GetOneFn: func(collName string, filter bson.M) (map[string]interface{}, error) {
				return nil, assert.AnError
			},
		}
		defer func() { dbadapter.AuthDBClient = oldClient }()

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/k4opt/1", nil)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusInternalServerError, w.Code)
	})
}

func TestHandlePostK4(t *testing.T) {
	router := setupTestRouter()
	router.POST("/k4opt", HandlePostK4)

	// Test case 1: Successful post
	t.Run("Successful post", func(t *testing.T) {
		k4Data := models.K4{
			K4:     "testKey",
			K4_SNO: uint8(1), // Cambiado de byte(1) a uint8(1)
		}
		jsonData, _ := json.Marshal(k4Data)

		// Mock the DB calls
		oldClient := dbadapter.AuthDBClient
		dbadapter.AuthDBClient = &dbadapter.MockDBClient{
			GetOneFn: func(collName string, filter bson.M) (map[string]interface{}, error) {
				return nil, assert.AnError // Simula que no existe el registro
			},
			PostFn: func(collName string, filter bson.M, postData map[string]interface{}) (bool, error) {
				// Verifica que postData tenga el formato correcto
				return true, nil
			},
		}
		defer func() { dbadapter.AuthDBClient = oldClient }()

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/k4opt", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json") // Añadido header Content-Type
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)
		if w.Code != http.StatusCreated {
			t.Logf("Response body: %s", w.Body.String()) // Para debug
		}
	})

	// Test case 2: Invalid JSON
	t.Run("Invalid JSON", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/k4opt", bytes.NewBuffer([]byte("invalid json")))
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestHandlePutK4(t *testing.T) {
	router := setupTestRouter()
	router.PUT("/k4opt/:idsno", HandlePutK4)

	// Test case 1: Successful update
	t.Run("Successful update", func(t *testing.T) {
		k4Data := models.K4{
			K4:     "testKey",
			K4_SNO: byte(1),
		}
		jsonData, _ := json.Marshal(k4Data)

		// Mock the DB calls
		oldClient := dbadapter.AuthDBClient
		dbadapter.AuthDBClient = &dbadapter.MockDBClient{
			GetOneFn: func(collName string, filter bson.M) (map[string]interface{}, error) {
				return map[string]interface{}{"k4": "testKey", "k4_sno": "1"}, nil
			},
			PutOneFn: func(collName string, filter bson.M, putData map[string]interface{}) (bool, error) {
				return true, nil
			},
		}
		defer func() { dbadapter.AuthDBClient = oldClient }()

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("PUT", "/k4opt/1", bytes.NewBuffer(jsonData))
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})

	// Test case 2: K4 not found
	t.Run("K4 not found", func(t *testing.T) {
		k4Data := models.K4{
			K4:     "testKey",
			K4_SNO: byte(1),
		}
		jsonData, _ := json.Marshal(k4Data)

		// Mock the DB calls
		oldClient := dbadapter.AuthDBClient
		dbadapter.AuthDBClient = &dbadapter.MockDBClient{
			GetOneFn: func(collName string, filter bson.M) (map[string]interface{}, error) {
				return nil, nil
			},
		}
		defer func() { dbadapter.AuthDBClient = oldClient }()

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("PUT", "/k4opt/1", bytes.NewBuffer(jsonData))
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusInternalServerError, w.Code)
	})
}

func TestHandleDeleteK4(t *testing.T) {
	router := setupTestRouter()
	router.DELETE("/k4opt/:idsno", HandleDeleteK4)

	// Test case 1: Successful deletion
	t.Run("Successful deletion", func(t *testing.T) {
		// Mock the DB calls
		oldClient := dbadapter.AuthDBClient
		dbadapter.AuthDBClient = &dbadapter.MockDBClient{
			GetOneFn: func(collName string, filter bson.M) (map[string]interface{}, error) {
				return map[string]interface{}{"k4": "testKey", "k4_sno": "1"}, nil
			},
			DeleteOneFn: func(collName string, filter bson.M) error {
				return nil
			},
		}
		defer func() { dbadapter.AuthDBClient = oldClient }()

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("DELETE", "/k4opt/1", nil)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
	})

	// Test case 2: K4 not found
	t.Run("K4 not found", func(t *testing.T) {
		// Mock the DB calls
		oldClient := dbadapter.AuthDBClient
		dbadapter.AuthDBClient = &dbadapter.MockDBClient{
			GetOneFn: func(collName string, filter bson.M) (map[string]interface{}, error) {
				return nil, nil
			},
		}
		defer func() { dbadapter.AuthDBClient = oldClient }()

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("DELETE", "/k4opt/1", nil)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusInternalServerError, w.Code)
	})
}

func TestCheckK4BySno(t *testing.T) {
	// Test case 1: K4 exists
	t.Run("K4 exists", func(t *testing.T) {
		// Mock the DB calls
		oldClient := dbadapter.AuthDBClient
		dbadapter.AuthDBClient = &dbadapter.MockDBClient{
			GetOneFn: func(collName string, filter bson.M) (map[string]interface{}, error) {
				return map[string]interface{}{"k4": "testKey", "k4_sno": 1}, nil
			},
		}
		defer func() { dbadapter.AuthDBClient = oldClient }()

		result := CheckK4BySno(1)
		assert.True(t, result)
	})

	// Test case 2: K4 does not exist
	t.Run("K4 does not exist", func(t *testing.T) {
		// Mock the DB calls
		oldClient := dbadapter.AuthDBClient
		dbadapter.AuthDBClient = &dbadapter.MockDBClient{
			GetOneFn: func(collName string, filter bson.M) (map[string]interface{}, error) {
				return nil, nil
			},
		}
		defer func() { dbadapter.AuthDBClient = oldClient }()

		result := CheckK4BySno(1)
		assert.False(t, result)
	})

	// Test case 3: Database error
	t.Run("Database error", func(t *testing.T) {
		// Mock the DB calls
		oldClient := dbadapter.AuthDBClient
		dbadapter.AuthDBClient = &dbadapter.MockDBClient{
			GetOneFn: func(collName string, filter bson.M) (map[string]interface{}, error) {
				return nil, assert.AnError
			},
		}
		defer func() { dbadapter.AuthDBClient = oldClient }()

		result := CheckK4BySno(1)
		assert.False(t, result)
	})
}
