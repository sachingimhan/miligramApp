/* eslint-disable react-native/no-inline-styles */
import React, {Component, useState, useCallback, useEffect} from 'react';
import {Text, View, FlatList, Keyboard} from 'react-native';
import Toast from 'react-native-toast-message';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import database from '@react-native-firebase/database';
import {GiftedChat} from 'react-native-gifted-chat';
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

    this.isSubscribed = false;

    this.state = {
      data: props.route.params.item,
      messages: [],
      chatId: '',
      msg: [],
    };
  }

  componentDidMount() {
    this.isSubscribed = true;
    this.getChatId();
    return true;
  }

  componentDidUpdate() {
    return true;
  }

  componentWillUnmount() {
    this.isSubscribed = false;
  }

  getChats = async () => {
    firestore()
      .collection('Chats')
      .doc(this.state.chatId)
      .onSnapshot(
        result => {
          console.log(result);
          let chatList = [];
          if (result.exists) {
            let arr = result._data.chat;
            arr.forEach(e => {
              chatList.push({
                _id: e._id,
                createdAt: e.createdAt.toMillis(),
                text: e.text,
                user: e.user,
              });
            });
            this.setState({
              messages: chatList,
            });
          } else {
            console.log('Not Chat found.!');
          }
        },
        err => {
          console.log(err);
        },
      );
  };

  getChatId = async () => {
    firestore()
      .collection('Users')
      .doc(auth().currentUser.uid)
      .collection('Chats')
      .doc(this.state.data.uid)
      .onSnapshot(
        value => {
          if (value.exists) {
            this.setState({
              chatId: value._data.chatId,
            });
            console.log(this.state.chatId);
            this.getChats();
          }
        },
        err => console.log(err),
      );
  };

  sendMessage = (message = []) => {
    let msg = GiftedChat.append(this.state.messages, message);
    console.log(msg);
    this.sendToDb(msg[0]);
    // this.setState({
    //   messages: ,
    // });
  };

  sendToDb = async msg => {
    firestore()
      .collection('Chats')
      .doc(this.state.chatId)
      .set(
        {
          chat: firestore.FieldValue.arrayUnion(msg),
        },
        {merge: true},
      );
  };

  render() {
    return (
      <GiftedChat
        inverted={false}
        messages={this.state.messages}
        alwaysShowSend={true}
        onSend={messages => this.sendMessage(messages)}
        user={{
          _id: auth().currentUser.uid,
          name: auth().currentUser.displayName,
          avatar: auth().currentUser.photoURL,
        }}
      />
    );
  }
}
