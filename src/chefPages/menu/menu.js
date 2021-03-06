import React, { useState, useCallback } from "react";
import styles from "./menu.styles";
import {
  View,
  FlatList,
  Text,
  ScrollView,
  TouchableOpacity
} from "react-native";

import { Ionicons } from '@expo/vector-icons';

import firebase from "../../firebase/Firebase";
import "firebase/firestore";

import MenuItemView from './menuItemView';
import MenuDetailsView from "./menuDetailsView";

const data = [
  {
    key: 1,
    name: "Add a menu item",
    description:
      "Tip: click the green button to add your first menu item.",
    price: '$$',
    image: '',
  },
];

const FlatListItemSeparator = () => {
  return (
    <View
      style={styles.flatListItemSeparator}
    />
  );
}

var db = firebase.firestore();
const ref = db.collection('chefs').doc("cAim5UCNHnXPAvvK0sUa").collection("menu")



class Menu extends React.Component {
  constructor() {
    super();
    this.state = {
      mode: 'Details',
      value: '',
      data: [],
      item: {},
    };

    this.handleDetails = this.handleDetails.bind(this);
    this.addMenuItem = this.addMenuItem.bind(this);
    this.updateMenuItem = this.updateMenuItem.bind(this);
    this.deleteMenuItem = this.deleteMenuItem.bind(this);
  }


  //FETCH CURRENT CHEF MENU
  componentDidMount() {
    let currentComponent = this;
    console.log("DOOINGIT")
        // Fetch Current chef 
        ref.get().then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                console.log(doc.id, " => ", doc.data());
                currentComponent.setState(state => {
                    const data = [doc.data(), ...state.data];
                    return {
                      data,
                      value: doc.data(),
                      
                    };
                });
            });
        });   
}

  // Handle menu details mode 
  handleMode = (mode) => {
    this.setState({
      mode: mode
    })
  }

  // Show menu item details 
  handleDetails = (item) => {
    this.setState({
      item: item
    })
  };

  // Add new menu item
  addMenuItem = (item) => {
    this.setState(state => {
      const data = [item, ...state.data];
      return {
        data,
        value: item,
        item: item
      };
    });
    // Change menu mode 
    this.handleMode("Details")

    // Add menu item to Firebase 
    ref.add(
      {
        key: item.key,
        name: item.name,
        description: item.description,
        price: item.price,
      }
    )

    //check and Add Image to Firebase Storage
    if(item.image != null){
      var storage = firebase.storage().ref(item.image.name)
      storage.put(item.image.file).then((snapshot) => {
        snapshot.ref.getDownloadURL().then(function(downloadURL) {
          console.log("File available at", downloadURL);

          ref.where('key','==',item.key).get().then(function(snapshot) {
            snapshot.forEach(function(doc) {
                console.log(doc.id)
                ref.doc(doc.id).update(
                  {
                    imageURL:downloadURL
                  }
                )
            })
        })
        });
      })
      }

  };

  // Update menu Item 
  updateMenuItem = (item) => {
    this.setState(state => {
      const data = state.data.map((previousItem, j) => {
        if (j === item) {
          return item;
        } else {
          return previousItem;
        }
      });
      return {
        data,
      };
    });
    // Update menu item in Firebase 
    ref.where('key','==',item.key).get().then(function(snapshot) {
      snapshot.forEach(function(doc) {
          console.log(doc.id)
          ref.doc(doc.id).update(
            {
              key: item.key,
              name: item.name,
              description: item.description,
              price: item.price,
            }
          )
      })
  })
    //check and Add Image to Firebase Storage
    //check if image changed
    if(typeof item.image != 'string'){
      console.log("UPDATEDIMAGE",item.image)
      var storage = firebase.storage().ref(item.image.name)
      storage.put(item.image.file).then((snapshot) => {
        snapshot.ref.getDownloadURL().then(function(downloadURL) {
          console.log("File available at", downloadURL);
          ref.where('key','==',item.key).get().then(function(snapshot) {
            snapshot.forEach(function(doc) {
                console.log(doc.id)
                ref.doc(doc.id).update(
                  {
                    imageURL:downloadURL
                  }
                )
            })
        })
        });
      })
      }

  };

  // Delete menu Item 
  deleteMenuItem = (item) => {
    if (item.key === 1) { return }
    this.setState(state => {
      const data = state.data.filter(otherItem => otherItem.key !== item.key);
      return {
        data,
        item: data[0]
      };
    });
    // Delete menu item in Firebase
    ref.where('key','==',item.key).get().then(function(snapshot) {
      snapshot.forEach(function(doc) {
          console.log(doc.id)
          ref.doc(doc.id).delete()
      })
  })

  };


  render() {
    if(true === true) {
    return (
      <View style={styles.container}>
        <View style={styles.titleParentContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>{this.state.data.length - 1} menu items</Text>
            <Text style={styles.secondaryTitle}>Add, update and remove a menu item.</Text>
          </View>
          <TouchableOpacity onPress={() => this.setState({ mode: 'Add' })}>
            <Ionicons name="ios-add" size={30} color="#34C759" />
          </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: '#D6D6D6', height: 1, width: '100%' }} />

        <View style={{
          flexDirection: 'row', flex: 2
        }}>
          <FlatList
            style={styles.flatList}
            data={this.state.data}
            showsVerticalScrollIndicator={true}
            extraData={this.state}
            renderItem={({ item }) => (
              <MenuItemView item={item} handleDetails={this.handleDetails} />
            )}
            ItemSeparatorComponent={FlatListItemSeparator}
          />
        </View>
        <MenuDetailsView
          item={this.state.item}
          mode={this.state.mode}
          handleMode={this.handleMode}
          updateMenuItem={this.updateMenuItem}
          addMenuItem={this.addMenuItem}
          deleteMenuItem={this.deleteMenuItem}
        />
      </View>

    );
    }
    else {
      return (<View style={styles.container}>
        <View style={styles.titleParentContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>{this.state.data.length - 1} menu items</Text>
            <Text style={styles.secondaryTitle}>BING, update and remove a menu item.</Text>
          </View>
          <TouchableOpacity onPress={() => this.setState({ mode: 'Add' })}>
            <Ionicons name="ios-add" size={30} color="#34C759" />
          </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: '#D6D6D6', height: 1, width: '100%' }} />

        <View style={{
          flexDirection: 'row', flex: 2
        }}>
          <FlatList
            style={styles.flatList}
            data={this.state.data}
            showsVerticalScrollIndicator={true}
            extraData={this.state}
            renderItem={({ item }) => (
              <MenuItemView item={item} handleDetails={this.handleDetails} />
            )}
            ItemSeparatorComponent={FlatListItemSeparator}
          />
        </View>
        <MenuDetailsView
          item={this.state.item}
          mode={this.state.mode}
          handleMode={this.handleMode}
          updateMenuItem={this.updateMenuItem}
          addMenuItem={this.addMenuItem}
          deleteMenuItem={this.deleteMenuItem}
        />
      </View>)
    }
  }
}

export default Menu;
