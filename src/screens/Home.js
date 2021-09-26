/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {View, ScrollView} from 'react-native';
import {Avatar, Button, Card, Title, Paragraph} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import * as Parallel from 'async-parallel';

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: {},
      postList: [],
      followerIds: [],
    };
  }

  componentDidUpdate() {
    this.state.user = auth().currentUser;
  }

  componentDidMount() {
    this.state.user = auth().currentUser;
    this.loadPosts();
    // firestore()
    //   .collection('Users')
    //   .doc(this.state.user.uid)
    //   .collection('Posts')
    //   .orderBy('timestamp', 'desc')
    //   .onSnapshot(
    //     result => {
    //       let list = [];
    //       result.docs.forEach(e => {
    //         list.push(e);
    //       });
    //       this.setState({
    //         postList: list,
    //       });
    //     },
    //     err => {
    //       console.log(err);
    //     },
    //   );
  }

  loadPosts = async () => {
    let tasks = [
      () => {
        let t = [];
        firestore()
          .collection('Users')
          .doc(auth().currentUser.uid)
          .collection('followers')
          .onSnapshot(result => {
            result.docs.forEach(e => {
              t.push(e._data.followerId);
            });
            t.push(auth().currentUser.uid);
            this.setState({
              followerIds: t,
            });
          });
      },
      () => {
        let list = [];
        firestore()
          .collection('Users')
          .onSnapshot(result => {
            result.forEach(e => {
              e.ref.collection('Posts').onSnapshot(
                res => {
                  res.docs.forEach(v => {
                    if (this.state.followerIds.indexOf(v._data.uid) >= 0) {
                      list.push({
                        user: {
                          uid: e.data().uid,
                          userName: e.data().userName,
                          photoURL: e.data().photoURL,
                        },
                        post: v._data,
                      });
                    }
                  });
                  this.setState({postList: []});
                  let arr = list.sort((a, b) => {
                    if (a.post.timestamp > b.post.timestamp) {
                      return -1;
                    }
                    if (a.post.timestamp < b.post.timestamp) {
                      return 1;
                    }
                    return 0;
                  });
                  this.setState({
                    postList: arr,
                  });
                },
                err => {
                  console.log(err);
                },
              );
            });
          });
      },
    ];
    Parallel.each(tasks, item => {
      item.call();
    });
  };

  render() {
    return (
      <View>
        <ScrollView
          style={{
            marginTop: 20,
            margin: 5,
          }}>
          {this.state.postList.map((v, i) => {
            return (
              <Card key={i}>
                <Card.Title
                  title={v.user.userName}
                  subtitle={new Date(v.post.timestamp * 1000).toDateString()}
                  left={props => (
                    <Avatar.Image
                      {...props}
                      source={{
                        uri: v.user.photoURL,
                      }}
                    />
                  )}
                />
                <Card.Cover style={{height: 310}} source={{uri: v.post.url}} />
                <Card.Content>
                  <Title>{v.post.cap}</Title>
                  <Paragraph>Likes : {v.post.likeCount}</Paragraph>
                </Card.Content>
                <Card.Actions>
                  <Button
                    icon={props => <Ionicons name="heart-outline" size={25} />}
                  />
                  <Button
                    icon={props => (
                      <Ionicons name="chatbubble-outline" size={25} />
                    )}
                  />
                </Card.Actions>
              </Card>
            );
          })}
        </ScrollView>
      </View>
    );
  }
}

// heart

// this.state.user.photoURL ||
// 'https://ui-avatars.com/api/?name=' +
// this.state.user.displayName +
// '&background=random&color=ffffff&size=128&font-size=0.40'
