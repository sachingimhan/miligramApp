/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {Text, View, FlatList} from 'react-native';
import Toast from 'react-native-toast-message';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import * as Parallel from 'async-parallel';
import {
  Avatar,
  Title,
  Button,
  Paragraph,
  Portal,
  Modal,
  TextInput,
  Card,
} from 'react-native-paper';

export default class Chat extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userList: [],
      followedList: [],
    };

    this.onlineUsers = this.onlineUsers.bind(this);
    this.genarateChatId = this.genarateChatId.bind(this);
    this.makeChat = this.makeChat.bind(this);
  }

  componentDidMount() {
    this.currentFollowers();
    this.onlineUsers();
  }

  currentFollowers = async () => {
    let list = [];
    await firestore()
      .collection('Users')
      .doc(auth().currentUser.uid)
      .collection('followers')
      .onSnapshot(snap => {
        if (!snap.empty) {
          snap.docs.forEach(e => {
            list.push(e._data.followerId);
          });

          this.setState({
            followedList: list,
          });
        } else {
          this.setState({
            followedList: [],
          });
        }
      });
  };

  makeChat = item => {
    let chatId = this.genarateChatId(10);
    Parallel.invoke(
      [
        async () => {
          let c1 = firestore()
            .collection('Users')
            .doc(auth().currentUser.uid)
            .collection('Chats')
            .doc(item.uid);
          let chat = await c1.get();
          if (!chat.exists) {
            c1.set({
              chatId: chatId,
              userId: item.uid,
            });
          }
        },
        async () => {
          let c2 = firestore()
            .collection('Users')
            .doc(item.uid)
            .collection('Chats')
            .doc(auth().currentUser.uid);
          let chat = await c2.get();
          if (!chat.exists) {
            c2.set({
              chatId: chatId,
              userId: auth().currentUser.uid,
            });
          }
        },
      ],
      2,
    ).then(value => {
      this.props.navigation.navigate('Chat', {
        item: item,
        chatId: chatId,
      });
    });
  };

  genarateChatId = len => {
    let result = '';
    let characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < len; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  onlineUsers = async () => {
    let users = [];
    await firestore()
      .collection('Users')
      .get()
      .then(result => {
        result.docs.forEach(e => {
          if (this.state.followedList.indexOf(e._data.uid) >= 0) {
            // e._data.uid !== auth().currentUser.uid
            users.push(e._data);
          }
        });
        this.setState({
          userList: users,
        });
      })
      .catch(err => {
        console.log(err);
      });
  };

  render() {
    return (
      <View
        style={{
          padding: 20,
        }}>
        <Title
          style={{
            marginBottom: 20,
            alignSelf: 'center',
          }}>
          Chat List
        </Title>
        <FlatList
          data={this.state.userList}
          keyExtractor={item => item.uid}
          renderItem={({item}) => {
            return (
              <Card
                style={{
                  marginBottom: 10,
                }}
                onPress={() => this.makeChat(item)}>
                <Card.Title
                  title={item.userName}
                  subtitle="online"
                  left={props => (
                    <Avatar.Image
                      {...props}
                      source={{
                        uri: item.photoURL,
                      }}
                    />
                  )}
                  right={props => (
                    <Avatar.Icon
                      style={{marginRight: 15, backgroundColor: '#fff'}}
                      {...props}
                      icon="chat"
                    />
                  )}
                />
              </Card>
            );
          }}
        />
        <Toast ref={ref => Toast.setRef(ref)} />
      </View>
    );
  }
}
