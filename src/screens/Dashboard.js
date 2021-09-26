import React, {Component} from 'react';
import {Provider} from 'react-native-paper';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import Home from './Home';
import CreatePost from './CreatePost';
import ChatList from './ChatList';
import Profile from './Profile';
import Chat from './Chat';
import Users from './Users';

const Tab = createMaterialBottomTabNavigator();

export default class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: {},
    };
  }

  componentDidUpdate() {
    this.state.user = auth().currentUser;
  }

  render() {
    return (
      <Provider>
        <Tab.Navigator initialRouteName="Home" shifting>
          <Tab.Screen
            options={{
              tabBarColor: '#009688',
              tabBarIcon: ({color}) => (
                <FontAwesome name="home" color={color} size={26} />
              ),
            }}
            name="Home"
            component={Home}
          />
          <Tab.Screen
            options={{
              tabBarColor: '#009688',
              tabBarIcon: ({color}) => (
                <FontAwesome name="search" color={color} size={26} />
              ),
            }}
            name="Search"
            component={Users}
          />
          <Tab.Screen
            options={{
              tabBarColor: '#009688',
              tabBarIcon: ({color}) => (
                <FontAwesome name="plus-circle" color={color} size={26} />
              ),
            }}
            name="Post"
            component={CreatePost}
          />
          <Tab.Screen
            options={{
              tabBarColor: '#009688',
              tabBarIcon: ({color}) => (
                <Ionicons name="chatbox" color={color} size={26} />
              ),
            }}
            name="ChatList"
            component={ChatList}
          />
          <Tab.Screen
            options={{
              tabBarColor: '#009688',
              tabBarIcon: ({color}) => (
                <FontAwesome name="user-circle" color={color} size={24} />
              ),
            }}
            name="Profile"
            component={Profile}
          />
        </Tab.Navigator>
      </Provider>
    );
  }
}
