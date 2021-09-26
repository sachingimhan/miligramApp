import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';
import {Button, TextInput} from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import firestore from '@react-native-firebase/firestore';

export default class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: '',
      userEmail: '',
      userPass: '',
    };
    this.signUp = this.signUp.bind(this);
  }

  signUp = async () => {
    if (!this.state.userName || !this.state.userEmail || !this.state.userPass) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Empty User Name or Email or Password Found.',
        visibilityTime: 30,
      });
      return false;
    }
    await auth()
      .createUserWithEmailAndPassword(this.state.userEmail, this.state.userPass)
      .then(res => {
        if (res.user) {
          res.user
            .updateProfile({
              displayName: this.state.userName,
              photoURL:
                'https://ui-avatars.com/api/?name=' +
                this.state.userName +
                '&background=random&color=ffffff&size=128&font-size=0.40',
            })
            .then(async s => {
              await firestore()
                .collection('Users')
                .doc(res.user.uid)
                .set({
                  uid: res.user.uid,
                  postCount: 0,
                  followersCount: 0,
                  followingCount: 0,
                  bio: 'Hi there, I am Now on Miligarm.',
                  userName: this.state.userName,
                  photoURL:
                    'https://ui-avatars.com/api/?name=' +
                    this.state.userName +
                    '&background=random&color=ffffff&size=128&font-size=0.40',
                })
                .then(() => {
                  Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Sign Up Success',
                    autoHide: true,
                    visibilityTime: 10,
                    onHide: () => {
                      this.props.navigation.navigate('Login');
                    },
                  });
                });
            });
        }
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'That email address is already in use!',
            autoHide: true,
            visibilityTime: 10,
          });
        }

        if (error.code === 'auth/invalid-email') {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'That email address is invalid!',
            autoHide: true,
            visibilityTime: 10,
          });
        }
      });
  };

  render() {
    return (
      <ImageBackground
        style={style.background}
        source={require('../assets/images/gradient-background_1.jpg')}
        resizeMode="cover">
        <KeyboardAvoidingView style={style.container}>
          <TextInput
            style={style.text}
            label="User Name"
            returnKeyType="next"
            onChangeText={text => {
              this.setState({
                userName: text,
              });
            }}
            autoCapitalize="none"
            textContentType="name"
            keyboardType="default"
          />
          <TextInput
            style={style.text}
            label="Email"
            returnKeyType="next"
            onChangeText={text => {
              this.setState({
                userEmail: text,
              });
            }}
            autoCapitalize="none"
            autoCompleteType="email"
            textContentType="emailAddress"
            keyboardType="email-address"
          />

          <TextInput
            style={style.text}
            label="Password"
            returnKeyType="done"
            onChangeText={text => {
              this.setState({
                userPass: text,
              });
            }}
            secureTextEntry
          />

          <Button
            style={style.button}
            mode="contained"
            onPress={() => {
              this.signUp();
            }}>
            Sign Up
          </Button>

          <View style={style.row}>
            <Text style={style.label}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('Login')}>
              <Text style={style.link}>Login</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        <Toast ref={ref => Toast.setRef(ref)} />
      </ImageBackground>
    );
  }
}
const style = StyleSheet.create({
  view: {
    margin: 20,
  },
  button: {
    width: '100%',
    margin: 5,
  },
  text: {
    width: '100%',
    marginBottom: 10,
    borderRadius: 6,
    borderBottomWidth: 0,
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    padding: 20,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    flex: 1,
    width: '100%',
  },
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  label: {
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  link: {
    fontWeight: 'bold',
    color: '#fff',
  },
});
