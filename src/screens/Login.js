/* eslint-disable react-native/no-inline-styles */
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId:
    '538706366121-k9lhpi3hrdo1lc7hbo5i14flh6i0stpr.apps.googleusercontent.com',
});

export default class Login extends Component {
  constructor(porps) {
    super(porps);
    this.state = {
      userEmail: '',
      userPass: '',
    };
    this.signIn = this.signIn.bind(this);
    if (auth().currentUser) {
      this.props.navigation.navigate('Dashboard');
    } else {
      this.props.navigation.navigate('Login');
    }
  }

  signInWithGoogle = async () => {
    const {idToken} = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    auth()
      .signInWithCredential(googleCredential)
      .then(async result => {
        console.log(result.user);
        if (result.user) {
          if (
            result.user.photoURL === null ||
            result.user.photoURL === undefined
          ) {
            result.user
              .updateProfile({
                photoURL:
                  'https://ui-avatars.com/api/?name=' +
                  this.state.userName +
                  '&background=random&color=ffffff&size=128&font-size=0.40',
              })
              .then(async s => {
                await firestore()
                  .collection('Users')
                  .doc(result.user.uid)
                  .set({
                    uid: result.user.uid,
                    postCount: 0,
                    followersCount: 0,
                    followingCount: 0,
                    bio: 'Hi there, I am Now on Miligarm.',
                    userName: result.user.displayName,
                    photoURL:
                      'https://ui-avatars.com/api/?name=' +
                      this.state.userName +
                      '&background=random&color=ffffff&size=128&font-size=0.40',
                  })
                  .then(() => {
                    let message = result.additionalUserInfo.isNewUser
                      ? 'Welcome ' + result.user.displayName
                      : 'Welcome Back ' + result.user.displayName;
                    Toast.show({
                      type: 'success',
                      text1: 'Success',
                      text2: message,
                      autoHide: true,
                      visibilityTime: 10,
                      onHide: () => {
                        this.props.navigation.navigate('Dashboard');
                      },
                    });
                  });
              });
          }
        }
        // let message = result.additionalUserInfo.isNewUser
        //   ? 'Welcome ' + result.user.displayName
        //   : 'Welcome Back ' + result.user.displayName;
        // Toast.show({
        //   type: 'success',
        //   text1: 'Success',
        //   text2: message,
        //   autoHide: true,
        //   visibilityTime: 15,
        //   onHide: () => {
        //     this.props.navigation.navigate('Dashboard');
        //   },
        // });
      })
      .catch(error => {
        Toast.show({
          type: 'error',
          text1: error.code,
          text2: error.message,
          visibilityTime: 20,
        });
      });
  };

  signIn = async () => {
    if (!this.state.userEmail || !this.state.userPass) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Empty Email or Password Found.',
        autoHide: true,
        visibilityTime: 15,
      });
      return false;
    }
    await auth()
      .signInWithEmailAndPassword(this.state.userEmail, this.state.userPass)
      .then(async result => {
        await AsyncStorage.setItem('@user', JSON.stringify(result.user));
        let message = result.additionalUserInfo.isNewUser
          ? 'Welcome ' + result.user.displayName
          : 'Welcome Back ' + result.user.displayName;
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: message,
          autoHide: true,
          visibilityTime: 15,
          onHide: () => {
            this.props.navigation.navigate('Dashboard');
          },
        });
      })
      .catch(error => {
        Toast.show({
          type: 'error',
          text1: error.code,
          text2: error.message,
          visibilityTime: 20,
        });
      });
  };

  render() {
    return (
      <ImageBackground
        style={style.background}
        source={require('../assets/images/gradient-background_3.jpg')}
        resizeMode="cover">
        <KeyboardAvoidingView style={style.container}>
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

          <View style={style.forgotPassword}>
            <TouchableOpacity onPress={() => console.log('dhfsdf')}>
              <Text style={style.label}>Forgot your password?</Text>
            </TouchableOpacity>
          </View>

          <Button
            style={style.button}
            mode="contained"
            onPress={() => {
              this.signIn();
            }}>
            Login
          </Button>

          <View style={style.row}>
            <Text style={style.label}>Don’t have an account? </Text>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('SignUp')}>
              <Text style={style.link}>Sign up</Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              marginTop: 20,
            }}>
            <Button
              style={style.button}
              mode="contained"
              icon="google"
              color="#DB4437"
              onPress={() => {
                this.signInWithGoogle();
              }}>
              Sign With Google
            </Button>
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
