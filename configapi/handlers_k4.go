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

	k4List := make([]models.K4, 0)
	k4DataList, errGetMany := dbadapter.CommonDBClient.RestfulAPIGetMany(k4KeysColl, bson.M{})
	if errGetMany != nil {
		logger.DbLog.Errorf("failed to retrieve k4 keys list with error: %+v", errGetMany)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve k4 keys list"})
		return
	}

	for _, k4Data := range k4DataList {
		tmp := models.K4{
			K4: k4Data["k4"].(string),
		}

		K4SNO_String := k4Data["k4_sno"].(string)
		K4SNO_Int, err := strconv.Atoi(K4SNO_String)
		K4_SNO := byte(K4SNO_Int)
		if err != nil {
			panic(err)
		}

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
	filterSnoID := bson.M{"k4_sno": snoId}

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
}

// HandlePostK4 handles POST /k4opt
func HandlePostK4(c *gin.Context) {
	setCorsHeader(c)

	var k4Data models.K4
	var err error

	rawData, err := c.GetRawData()

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to get raw data"})
		return
	}

	err = json.Unmarshal(rawData, &k4Data)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to unmarshall the json"})
		return
	}

	if CheckK4BySno(string(k4Data.K4_SNO)) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "the k4 is present or there is a internal server errror"})
		return
	}

	K4DataBsonA := configmodels.ToBsonM(k4Data)
	if _, err = dbadapter.AuthDBClient.RestfulAPIPost(k4KeysColl, bson.M{}, K4DataBsonA); err != nil {
		logger.DbLog.Errorf("failed to post k4 key to the the DB error: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ocurred an error in the post to the DB"})
		return
	}

	c.JSON(http.StatusCreated, k4Data)
}

// HandlePutK4 handles PUT /k4opt/:idsno
func HandlePutK4(c *gin.Context) {
	setCorsHeader(c)
	logger.WebUILog.Infoln("Put One K4 key Data")

	snoId := c.Param("idsno")
	var k4Data models.K4

	if err := c.ShouldBindJSON(&k4Data); err != nil {
		logger.WebUILog.Errorf("Put One K4 key Data - ShouldBindJSON failed: %+v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: failed to parse JSON."})
		return
	}

	if !CheckK4BySno(string(k4Data.K4_SNO)) {
		logger.WebUILog.Errorf("k4 key with SNO %s does not exist", snoId)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "the k4 is present or there is a internal server errror"})
		return
	}

	filter := bson.M{"k4_sno": snoId}

	updateData := configmodels.ToBsonM(k4Data)
	if _, err := dbadapter.AuthDBClient.RestfulAPIPutOne(k4KeysColl, filter, updateData); err != nil {
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

	if !CheckK4BySno(snoId) {
		logger.WebUILog.Errorf("k4 key with SNO %s does not exist", snoId)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "the k4 is not present or there is an internal server error"})
		return
	}

	filter := bson.M{"k4_sno": snoId}

	if err := dbadapter.AuthDBClient.RestfulAPIDeleteOne(k4KeysColl, filter); err != nil {
		logger.DbLog.Errorf("failed to delete k4 key in DB: %+v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete k4 key"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "k4 key deleted successfully"})
}

func CheckK4BySno(snoId string) bool {
	var k4Data models.K4
	filterSnoID := bson.M{"k4_sno": snoId}

	k4DataInterface, err := dbadapter.AuthDBClient.RestfulAPIGetOne(k4KeysColl, filterSnoID)

	if err != nil {
		logger.DbLog.Errorf("failed to fetch k4 key data from DB: %+v", err)
		return false
	}

	if k4DataInterface != nil {
		err := json.Unmarshal(configmodels.MapToByte(k4DataInterface), &k4Data)
		if err != nil {
			logger.WebUILog.Errorf("error unmarshalling k4 key data: %+v", err)
			return true
		}
	}

	return true
}
