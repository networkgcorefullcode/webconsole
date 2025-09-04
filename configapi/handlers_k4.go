package configapi

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/omec-project/openapi/models"
	"github.com/omec-project/webconsole/backend/logger"
	"github.com/omec-project/webconsole/configmodels"
	"github.com/omec-project/webconsole/dbadapter"
	"go.mongodb.org/mongo-driver/bson"
)

// HandleGetsK4 handles GET /k4opt
// Here a query is made to MongoDB to obtain all
// the k4 keys, that is, a list containing all the K4
func HandleGetsK4(c *gin.Context) {
	setCorsHeader(c)

	logger.WebUILog.Infoln("Get All K4 keys List")

	k4List := make([]models.K4, 10)
	k4DataList, errGetMany := dbadapter.AuthDBClient.RestfulAPIGetMany(k4KeysColl, bson.M{})
	if errGetMany != nil {
		logger.DbLog.Errorf("failed to retrieve k4 keys list with error: %+v", errGetMany)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve k4 keys list"})
		return
	}

	for _, k4Data := range k4DataList {
		tmp := models.K4{
			K4: k4Data["k4"].(string),
		}

		K4SNO_Int := k4Data["k4_sno"].(int)
		K4_SNO := byte(K4SNO_Int)

		tmp.K4_SNO = K4_SNO

		k4List = append(k4List, tmp)
	}

	c.JSON(http.StatusOK, k4List)
}

// HandleGetK4 handles GET /k4opt/:idsno
// Aqui se obtiene una unica llave k4 segun la secuencia enviada
func HandleGetK4(c *gin.Context) {
	setCorsHeader(c)

	logger.WebUILog.Infoln("Get One K4 key Data")

	snoId := c.Param("idsno")
	snoIdint, _ := strconv.Atoi(snoId)

	filterSnoID := bson.M{"k4_sno": snoIdint}

	var k4Data models.K4

	k4DataInterface, err := dbadapter.AuthDBClient.RestfulAPIGetOne(k4KeysColl, filterSnoID)

	if err != nil {
		logger.DbLog.Errorf("failed to fetch k4 key data from DB: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch the requested k4 key record from DB"})
		return
	}

	if k4DataInterface != nil {
		err := json.Unmarshal(configmodels.MapToByte(k4DataInterface), &k4Data)
		if err != nil {
			logger.WebUILog.Errorf("error unmarshalling k4 key data: %+v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve k4 key"})
			return
		}
	}

	c.JSON(http.StatusOK, k4Data)
}

// HandlePostK4 handles POST /k4opt
func HandlePostK4(c *gin.Context) {
	setCorsHeader(c)

	logger.WebUILog.Infoln("Post One K4 key Data")

	var k4Data models.K4
	var err error

	rawData, err := c.GetRawData()
	if err != nil {
		logger.WebUILog.Errorf("failed to get raw data: %+v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to get raw data"})
		return
	}

	logger.WebUILog.Infof("Raw data received: %s", string(rawData))

	err = json.Unmarshal(rawData, &k4Data)
	if err != nil {
		logger.WebUILog.Errorf("failed to unmarshall the json: %+v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to unmarshall the json"})
		return
	}

	logger.WebUILog.Infof("Parsed K4 data: %+v", k4Data)

	// TODO: delete if the code work
	// if !CheckK4BySno(int(k4Data.K4_SNO)) {
	// 	logger.WebUILog.Infof("K4 key with SNO %d already exists", k4Data.K4_SNO)
	// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "the k4 is present or there is a internal server errror"})
	// 	return
	// }

	logger.WebUILog.Infof("K4 data to be inserted: %+v", k4Data)

	if err := K4HelperPut(int(k4Data.K4_SNO), &k4Data); err != nil {
		logger.DbLog.Errorf("failed to post k4 key in DB: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to post k4 key"})
		return
	}

	logger.WebUILog.Infoln("K4 key posted successfully")
	c.JSON(http.StatusCreated, k4Data)
}

// HandlePutK4 handles PUT /k4opt/:idsno
func HandlePutK4(c *gin.Context) {
	setCorsHeader(c)
	logger.WebUILog.Infoln("Put One K4 key Data")

	snoId := c.Param("idsno")
	snoIdint, _ := strconv.Atoi(snoId)
	var k4Data models.K4

	if err := c.ShouldBindJSON(&k4Data); err != nil {
		logger.WebUILog.Errorf("Put One K4 key Data - ShouldBindJSON failed: %+v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: failed to parse JSON."})
		return
	}

	// TODO: delete if the code work
	// if CheckK4BySno(int(k4Data.K4_SNO)) {
	// 	logger.WebUILog.Errorf("k4 key with SNO %d does not exist", snoIdint)
	// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "the k4 is present or there is a internal server errror"})
	// 	return
	// }

	if err := K4HelperPut(snoIdint, &k4Data); err != nil {
		logger.DbLog.Errorf("failed to update k4 key in DB: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update k4 key"})
		return
	}

	c.JSON(http.StatusOK, k4Data)
}

// HandleDeleteK4 handles DELETE /k4opt/:idsno
func HandleDeleteK4(c *gin.Context) {
	setCorsHeader(c)
	logger.WebUILog.Infoln("Delete One K4 key Data")

	snoId := c.Param("idsno")
	snoIdint, _ := strconv.Atoi(snoId)

	// TODO: delete if the code work
	// if !CheckK4BySno(snoIdint) {
	// 	logger.WebUILog.Errorf("k4 key with SNO %s does not exist", snoId)
	// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "the k4 is not present or there is an internal server error"})
	// 	return
	// }

	if err := K4HelperDelete(snoIdint); err != nil {
		logger.DbLog.Errorf("failed to delete k4 key in DB: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete k4 key"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "k4 key deleted successfully"})
}

// TODO: delete if the code work
// func CheckK4BySno(snoId int) bool {
// 	var k4Data models.K4
// 	filterSnoID := bson.M{"k4_sno": snoId}

// 	k4DataInterface, err := dbadapter.AuthDBClient.RestfulAPIGetOne(k4KeysColl, filterSnoID)

// 	if err != nil || len(k4DataInterface) == 0 {
// 		logger.DbLog.Infoln("failed to fetch k4 key data from DB this key does'nt exist: %+v", err)
// 		return false
// 	}

// 	if k4DataInterface != nil {
// 		err := json.Unmarshal(configmodels.MapToByte(k4DataInterface), &k4Data)
// 		if err != nil {
// 			logger.WebUILog.Errorf("error unmarshalling k4 key data: %+v", err)
// 			return true
// 		}
// 	}

// 	return true
// }
