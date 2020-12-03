//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



//database.......................... ............

mongoose.connect("mongodb+srv://pranitcodes:Pranit@123@cluster0.e3cfp.mongodb.net/todolistDB", {useNewUrlParser:true});

//scema
const itemsSchema = {
  name: String

};
//model
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "welcometo the your todo list"
});

const item2 = new Item({
  name: "welcometo the your todo list"
});

const item3 = new Item({
  name: "welcometo the your todo list"
});

const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items:[itemsSchema]
}

const List = mongoose.model('List', listSchema);



//................................................................//
app.get("/", function(req, res) {

  Item.find({}, function (err, foundItems) {

   if (foundItems.length === 0) {

      Item.insertMany(defaultItems, function (err) {
         if (err) {
           console.log(err);
         } else {
            
           console.log("success");
         }
      });
     res.render("/");
   } else {

     res.render("list", { listTitle: "Today", newListItems: foundItems });
     
   }
      
  });
});
//..................................................
app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

 List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        console.log("Dosen'nt exits");
        //create a new list
        
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);

      } else {

        //show list 
        console.log("Exits");
         res.render("list", { listTitle:foundList.name , newListItems: foundList.items });
      }
    }
  });

});

//....................................................................................

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
   
  const item = new Item({
    name: itemName
  });
  
  if (listName === "Today") {
    
    item.save();
    res.redirect("/");


  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});
//..............................................................................

app.post("/delete", function(req, res) {

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {

    Item.findByIdAndRemove(checkedItemId, function (err, item) {
    
      if (err) {
        console.log(err);
  
      } else {
        console.log("succc remove");
        res.redirect("/");
      }
    });

    
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, list) {

      if (!err) {
        res.redirect("/" + listName);
      }
      
    })
  }
});
//.....................................................................................................


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}




app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
//....................................................................................................
