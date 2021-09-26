/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  TextInput,
} from 'react-native';
import {Button, Card} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import ImagePicker from 'react-native-image-crop-picker';
import Toast from 'react-native-toast-message';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';

export default class CreatePost extends Component {
  constructor(props) {
    super(props);

    this.openCamara = this.openCamara.bind(this);
    this.openImage = this.openImage.bind(this);
    this.createNew = this.createNew.bind(this);

    this.state = {
      showImage: false,
      imagePath: '',
      user: {},
      caption: '',
      imageName: '',
    };
  }

  componentDidMount() {
    this.state.user = auth().currentUser;
  }

  openImage = async () => {
    ImagePicker.openPicker({
      width: 310,
      height: 310,
      cropping: true,
    })
      .then(data => {
        if (data) {
          let imgName = this.state.user.uid + '-' + data.modificationDate;
          this.setState({
            imagePath: data.path,
            imageName: imgName,
            showImage: true,
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

  openCamara = async () => {
    ImagePicker.openCamera({
      width: 310,
      height: 310,
      cropping: true,
      mediaType: 'photo',
    })
      .then(data => {
        if (data) {
          let imgName = this.state.user.uid + '-' + data.modificationDate;
          this.setState({
            imagePath: data.path,
            imageName: imgName,
            showImage: true,
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

  createNew = async () => {
    if (
      !this.state.user ||
      !this.state.imageName ||
      !this.state.showImage ||
      !this.state.caption
    ) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Someting missing.!',
        autoHide: true,
        visibilityTime: 20,
      });
      return false;
    }

    let postImage = storage().ref(
      'posts/' + this.state.user.uid + '/' + this.state.imageName,
    );
    await postImage
      .putFile(this.state.imagePath)
      .then(async () => {
        let url = await postImage.getDownloadURL();

        let collPost = await firestore()
          .collection('Users')
          .doc(this.state.user.uid);

        collPost
          .collection('Posts')
          .doc()
          .set({
            uid: this.state.user.uid,
            url: url,
            cap: this.state.caption,
            timestamp: Date.now().toLocaleString(),
            likeCount: 0,
          })
          .then(() => {
            this.setState({
              caption: '',
              imageName: '',
              showImage: false,
            });
            Toast.show({
              type: 'success',
              text1: 'Success',
              text2: 'New Post Created.!',
              autoHide: true,
              visibilityTime: 10,
            });
          })
          .catch(() => {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Error: Post Upload',
              autoHide: true,
              visibilityTime: 20,
            });
          });
      })
      .catch(() => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Error: Post Upload Error',
          autoHide: true,
          visibilityTime: 20,
        });
      });
  };

  render() {
    return (
      <ImageBackground style={styles.background} resizeMode="cover">
        <KeyboardAvoidingView style={styles.container}>
          <Text style={styles.header}>New Post</Text>
          <View
            style={{
              width: 330,
              height: 370,
            }}>
            <Card>
              <Card.Content>
                <TextInput
                  placeholder="Write Something Here..."
                  style={{
                    height: 50,
                  }}
                  onChangeText={text => this.setState({caption: text})}
                  value={this.state.caption}
                />
              </Card.Content>
              {this.state.showImage ? (
                <Card.Cover
                  style={{
                    height: 310,
                  }}
                  resizeMode="cover"
                  source={{
                    uri: this.state.imagePath,
                  }}
                />
              ) : null}
            </Card>
          </View>
          <View style={styles.view}>
            <Button
              style={styles.button}
              contentStyle={{
                width: 80,
                height: 80,
              }}
              mode="outlined"
              color="#009688"
              onPress={() => this.openCamara()}>
              <Icon name="camera" size={40} color="#000" />
            </Button>
            <Button
              style={styles.button}
              contentStyle={{
                width: 80,
                height: 80,
              }}
              color="#009688"
              mode="outlined"
              onPress={() => this.openImage()}>
              <Icon name="image" size={40} color="#000" />
            </Button>
          </View>
          <Button mode="text" color="#009688" onPress={() => this.createNew()}>
            <Text
              style={{
                fontSize: 18,
              }}>
              Post
            </Text>
          </Button>
        </KeyboardAvoidingView>
        <Toast ref={ref => Toast.setRef(ref)} />
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    width: 80,
    height: 80,
    margin: 20,
    borderRadius: 20,
  },
  view: {
    flex: 1,
    flexDirection: 'row',
    margin: 0,
  },
  header: {
    fontSize: 22,
    color: '#009688',
    fontWeight: 'bold',
    paddingVertical: 14,
  },
  container: {
    flex: 1,
    padding: 5,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    flex: 1,
    width: '100%',
  },
});
