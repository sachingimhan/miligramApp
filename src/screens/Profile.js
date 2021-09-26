/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  Text,
  View,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import {
  Avatar,
  Title,
  Button,
  Paragraph,
  Portal,
  Modal,
  TextInput,
} from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import ImagePicker from 'react-native-image-crop-picker';
import Toast from 'react-native-toast-message';

export default class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: {},
      imageList: [],
      isVisable: false,
      profile: {
        userName: '',
        bio: '',
        postCount: 0,
        followersCount: 0,
        followingCount: 0,
      },
      localImagePath: '',
      imageName: '',
      newUserName: '',
      newBio: '',
    };

    this.state.user = auth().currentUser;
    this.getAllImages = this.getAllImages.bind(this);
    this.openImage = this.openImage.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.signOut = this.signOut.bind(this);
  }

  openImage = () => {
    ImagePicker.openPicker({
      width: 310,
      height: 310,
      cropping: true,
    })
      .then(data => {
        if (data) {
          let imgName = this.state.user.uid + '-' + data.modificationDate;
          this.setState({
            localImagePath: data.path,
            imageName: imgName,
          });
        }
      })
      .catch(error => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Someting went wrong.!',
          autoHide: true,
          visibilityTime: 20,
        });
      });
  };

  componentDidUpdate() {
    this.state.user = auth().currentUser;
    this.getAllImages();
  }

  componentDidMount() {
    this.getAllImages();
    this.getUserProfile();
  }

  hideModel = () => {
    this.setState({
      isVisable: false,
    });
  };

  updateProfile = async () => {
    if (this.state.localImagePath) {
      let ref = await storage().ref(
        'profile/' + this.state.user.uid + '/' + this.state.imageName,
      );
      ref
        .putFile(this.state.localImagePath)
        .then(async () => {
          let url = await ref.getDownloadURL();
          auth()
            .currentUser.updateProfile({
              photoURL: url,
            })
            .then(() => {
              firestore()
                .collection('Users')
                .doc(this.state.user.uid)
                .update({
                  photoURL: url,
                })
                .then(() => {
                  this.setState({
                    localImagePath: '',
                  });
                  this.hideModel();
                  Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Profile Picture Updated.!',
                    autoHide: true,
                    visibilityTime: 20,
                  });
                })
                .catch(() => {
                  Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Someting went wrong',
                    autoHide: true,
                    visibilityTime: 20,
                  });
                });
            });
        })
        .catch(() => {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Someting went wrong',
            autoHide: true,
            visibilityTime: 20,
          });
        });
    }
    if (this.state.newBio || this.state.newUserName) {
      firestore()
        .collection('Users')
        .doc(this.state.user.uid)
        .update({
          bio: this.state.newBio || this.state.profile.bio,
          userName: this.state.newUserName || this.state.profile.userName,
        })
        .then(() => {
          if (this.state.newUserName) {
            auth().currentUser.updateProfile({
              displayName: this.state.newUserName,
            });
          }
          this.setState({
            newBio: '',
            newUserName: '',
          });
          this.hideModel();
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Profile Update success.!',
            autoHide: true,
            visibilityTime: 20,
          });
        });
    }
  };

  signOut = async () => {
    // await auth()
    //   .signOut()
    //   .then(v => {
    //     Toast.show({
    //       type: 'success',
    //       text1: 'Success',
    //       text2: 'Good Bye..! See you soon.',
    //       autoHide: true,
    //       visibilityTime: 20,
    //       onHide: () => {
    //         this.props.navigation.navigate('Login');
    //       },
    //     });
    //   })
    //   .catch(err => {
    //     console.log(err);
    //   });
  };

  getUserProfile = async () => {
    firestore()
      .collection('Users')
      .doc(this.state.user.uid)
      .onSnapshot(
        doc => {
          if (doc.exists) {
            this.setState({
              profile: {
                userName: doc.data().userName,
                bio: doc.data().bio,
                postCount: doc.data().postCount,
                followersCount: doc.data().followersCount,
                followingCount: doc.data().followingCount,
              },
            });
          }
        },
        err => {
          console.log(err);
        },
      );
  };

  getAllImages = async () => {
    const imageRefs = await storage()
      .ref()
      .child('posts/' + this.state.user.uid)
      .listAll();

    const urls = await Promise.all(
      imageRefs.items.map(ref => {
        return ref.getDownloadURL();
      }),
    );
    this.setState({
      imageList: urls,
    });
  };

  render() {
    return (
      <ImageBackground style={styles.backGround}>
        <ScrollView style={styles.base}>
          <View
            style={{
              margin: 10,
            }}>
            <Title>{this.state.user.displayName}</Title>
            <Button
              color="#009688"
              mode="text"
              onPress={() => {
                this.signOut();
              }}
              style={{
                position: 'absolute',
                flex: 1,
                flexDirection: 'row',
                right: 0,
              }}>
              Logout
            </Button>
          </View>
          <View style={styles.topView}>
            <Avatar.Image
              source={{
                uri:
                  this.state.user.photoURL ||
                  'https://ui-avatars.com/api/?name=' +
                    this.state.user.displayName +
                    '&background=random&color=ffffff&size=128&font-size=0.40',
              }}
              size={75}
            />
            <View style={styles.container}>
              <View style={styles.profileData}>
                <Text>Posts</Text>
                <Title>{this.state.profile.postCount}</Title>
              </View>
              <View style={styles.profileData}>
                <Text>Followers</Text>
                <Title>{this.state.profile.followersCount}</Title>
              </View>
              <View style={styles.profileData}>
                <Text>Following</Text>
                <Title>{this.state.profile.followingCount}</Title>
              </View>
            </View>
          </View>
          <View
            style={{
              marginLeft: 10,
              marginTop: 10,
              marginRight: 10,
              marginBottom: 10,
            }}>
            <Paragraph style={{fontSize: 15}}>
              {this.state.profile.bio}
            </Paragraph>
          </View>
          <View
            style={{
              marginTop: 20,
            }}>
            <Button
              style={{width: '80%', alignItems: 'center', alignSelf: 'center'}}
              color="#009688"
              mode="text"
              onPress={() => {
                this.setState({
                  isVisable: true,
                });
              }}>
              Edit Profile
            </Button>
          </View>
          <View
            style={{
              marginTop: 15,
            }}>
            <ScrollView
              contentContainerStyle={{
                flex: 1,
                flexDirection: 'row',
                flexWrap: 'wrap',
              }}>
              {this.state.imageList.map((url, i) => {
                return (
                  <Image
                    key={i}
                    style={{width: 115, height: 115}}
                    source={{uri: url}}
                  />
                );
              })}
            </ScrollView>
          </View>
          <Portal>
            <Modal
              visible={this.state.isVisable}
              onDismiss={this.hideModel}
              contentContainerStyle={{
                backgroundColor: '#fff',
                padding: 15,
                margin: 20,
                alignItems: 'center',
                width: '90%',
              }}>
              <Title>Update Profile</Title>
              <Avatar.Image
                style={{
                  marginBottom: 10,
                  marginTop: 10,
                }}
                source={{
                  uri: this.state.localImagePath || this.state.user.photoURL,
                }}
                size={100}
                onTouchStart={() => {
                  this.openImage();
                }}
              />
              <Text style={{marginBottom: 20}}>
                *Touch on Profile Picture to Update
              </Text>
              <TextInput
                style={{
                  width: '100%',
                  marginBottom: 10,
                  borderRadius: 6,
                  borderBottomWidth: 0,
                }}
                label="Name"
                onChangeText={text => {
                  this.setState({
                    newUserName: text,
                  });
                }}
                autoCapitalize="none"
              />
              <TextInput
                style={{
                  width: '100%',
                  marginBottom: 10,
                  borderRadius: 6,
                  borderBottomWidth: 0,
                }}
                label="Bio"
                onChangeText={text => {
                  this.setState({
                    newBio: text,
                  });
                }}
              />
              <View style={{marginTop: 10}}>
                <Button
                  style={{
                    width: '80%',
                    alignItems: 'center',
                    alignSelf: 'center',
                  }}
                  color="#009688"
                  mode="text"
                  onPress={() => {
                    this.updateProfile();
                  }}>
                  Update Profile
                </Button>
              </View>
            </Modal>
          </Portal>
        </ScrollView>
        <Toast ref={ref => Toast.setRef(ref)} />
      </ImageBackground>
    );
  }
}
const styles = StyleSheet.create({
  backGround: {},
  base: {
    marginTop: 20,
    margin: 5,
  },
  topView: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: 10,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingLeft: 30,
    width: '115%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  profileData: {
    alignSelf: 'center',
    alignItems: 'center',
  },
});
