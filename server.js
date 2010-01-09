var sys = require("sys"),
http = require("http"),
fu = require("./fu");
var couchdb = require("./node-couch").CouchDB.db("jsconf");

function isblank(str) {
    if (!str) {
        return true;
    } 
		try	 {
	    return (str.replace(/^\s+|\s+$/, '') === "");
		} catch (e) {
			
			return false;
		}
}

function save_failed(data) {
	doc = {"category": "failed_speaker", "data": data, "created_at": (new Date())}
	couchdb.saveDoc(doc);
}	

fu.post("/app/register_speaker", function (req, res) {
    var data = "";
    req.addListener("body", function(chunk) {
        data += chunk;
    });
    req.addListener("complete", function() {
        try {
						data = data.split("=")[1];
            var clean_data = decodeURIComponent(data.replace(/\+/g," ")); //.replace(/\%40/g, "@").replace(/\%3A/g, ":").replace(/\%2C/g, ",").replace("submission=", "").replace(/\)$/, "");
            var reg_data = JSON.parse(clean_data);
            reg_data.category="speaker";
						reg_data.created_at = (new Date());
            if (isblank(reg_data.name) || isblank(reg_data.twitter) || isblank(reg_data.email) || isblank(reg_data.location) || isblank(reg_data.topic_title) || isblank(reg_data.topic_description) || isblank(reg_data.claim_to_fame)) {
  							save_failed(data);
                res.simpleJSON(200, { message: "If you follow the directions, there will be cake." });
            } else {
                couchdb.saveDoc(reg_data, {success: function(doc) {
                    res.simpleJSON(200, { message: "We got yer submission. ARR, we be gettin' back to you soon." });
                }, error: function(result) {
										save_failed(data);
                    res.simpleJSON(200, { message: "MUTINY WILL NOT BE TOLERATED!!!" });  
                }});
            }
        } catch (e) {
						save_failed(data);
            res.simpleJSON(200, { message: "MUTINY WILL NOT BE TOLERATED!!!" });      
        }
    });
});

fu.listen(8000, 'localhost');