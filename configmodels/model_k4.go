package configmodels

type K4 struct {
	K4       string `json:"k4" bson:"k4"`
	K4_SNO   byte   `json:"k4_sno" bson:"k4_sno"`
	K4_Label string `json:"key_label,omitempty" bson:"key_label,omitempty"`
}
