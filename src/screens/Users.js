/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {Text, View, FlatList} from 'react-native';
import Toast from 'react-native-toast-message';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
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

export default class Users extends Component {
  constructor(props) {
    super(props);
    (this.isSubscribed = false),
      (this.state = {
        userList: [],
        searchText: '',
        followedList: [],
      });

    this.searchUsersByName = this.searchUsersByName.bind(this);
    this.followUser = this.followUser.bind(this);
  }

  componentDidMount() {
    this.isSubscribed = true;
  }

  componentWillUnmount() {
    this.isSubscribed = false;
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

          this.isSubscribed &&
            this.setState({
              followedList: list,
            });
        } else {
          this.isSubscribed &&
            this.setState({
              followedList: [],
            });
        }
      });
  };

  followUser = async followerId => {
    await firestore()
      .collection('Users')
      .doc(auth().currentUser.uid)
      .collection('followers')
      .doc(followerId)
      .set({
        followerId: followerId,
        followed_at: new Date(),
      })
      .then(result => {
        this.currentFollowers();
      })
      .catch(err => {
        console.log(err);
      });
  };

  searchUsersByName = async () => {
    let users = [];
    this.currentFollowers();
    await firestore()
      .collection('Users')
      .orderBy('userName')
      .startAt(this.state.searchText)
      .endAt(this.state.searchText + '\uf8ff')
      .get()
      .then(result => {
        if (!result.empty) {
          result.docs.forEach(e => {
            if (e._data.uid !== auth().currentUser.uid) {
              users.push(e._data);
            }
          });
          this.isSubscribed &&
            this.setState({
              userList: users,
            });
        } else {
          this.isSubscribed &&
            this.setState({
              userList: [],
            });
        }
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
          Find Your Friends
        </Title>
        <TextInput
          style={{
            marginBottom: 20,
          }}
          placeholder="Type Name here..."
          value={this.state.searchText}
          onChangeText={text => {
            this.setState({searchText: text});
            this.searchUsersByName();
          }}
        />
        <FlatList
          data={this.state.userList}
          keyExtractor={item => item.uid}
          extraData={this.state}
          renderItem={({item}) => {
            return (
              <Card
                style={{
                  marginBottom: 10,
                }}
                onPress={() => {
                  console.log('asdas');
                }}>
                <Card.Title
                  title={item.userName}
                  subtitle={item.bio}
                  left={props => (
                    <Avatar.Image
                      {...props}
                      source={{
                        uri: item.photoURL,
                      }}
                    />
                  )}
                  right={props => {
                    return (
                      <Button
                        disabled={
                          this.state.followedList.indexOf(item.uid) >= 0
                            ? true
                            : false
                        }
                        mode="text"
                        onPress={() => {
                          this.followUser(item.uid);
                        }}>
                        Follow
                      </Button>
                    );
                  }}
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
