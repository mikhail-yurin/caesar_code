import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text, View,
  TextInput,
  ScrollView,
  ToastAndroid,
  Clipboard,
  TouchableOpacity,
  NativeModules,
} from 'react-native';
import Icon from "react-native-vector-icons/FontAwesome";

const alph = {
  ru: 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'.split(''),
  en: 'abcdefghijklmnopqrstuvwxyz'.split(''),
};

type Props = {};
export default class App extends Component<Props> {
  // todo multilanguage interface
  constructor(props) {
    super(props);
    this.state = {
      inputText: '',
      decodedText: '',
    };
    let langRegionLocale = "en_US";
    if (Platform.OS === "android") {
      langRegionLocale = NativeModules.I18nManager.localeIdentifier || "";
    } else if (Platform.OS === "ios") {
      langRegionLocale = NativeModules.SettingsManager.settings.AppleLocale || "";
    }
    let languageLocale = langRegionLocale.substring(0, 2) || 'en';
    this.state.languageLocale = languageLocale;
    this.state.language = languageLocale;
  }

  // componentDidMount() {
  //   this.setState({
  //     inputText: 'test !',
  //   });
  // }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.inputText !== prevState.inputText) {
      this.detectLang();
      this.caesar();
    }
    if (this.state.language !== prevState.language) {
      this.caesar();
    }
    return true;
  }

  detectLang() {
    const { inputText } = this.state;

    if (typeof inputText === 'string') {
      const firstLetter = inputText.split('')
        .find(char => alph.ru.includes(char) || alph.en.includes(char));
      if (firstLetter && alph.ru.includes(firstLetter)) {
        this.setState({ language: 'ru' });
      } else if (firstLetter && alph.en.includes(firstLetter)) {
        this.setState({ language: 'en' });
      }
    }
  }

  setLang() {
    this.setState({
      language: this.state.language === 'en' ? 'ru' : 'en',
    });
  }

  clearOrPaste() {
    if (this.state.inputText) {
      this.setState({ inputText: '' });
    } else {
      Clipboard.getString().then((data) => {
        this.setState({ inputText: data });
      }).catch((err) => {
        ToastAndroid.showWithGravityAndOffset(
          'Clipboard is empty',
          ToastAndroid.LONG,
          ToastAndroid.TOP,
          25,
          50,
        );
      });
    }
  }

  caesar() {
    const { inputText, language } = this.state;

    if (typeof inputText === 'string') {
      let possibleDecodedPhrases = [];
      let input = inputText.toLowerCase();

      // possibleDecodedPhrases.push(input + ' - IS ORIGINAL'); // ! for debug

      for (let shift = 1; shift <= alph[language].length; shift++) {
        const possibleDecodedPhrase = input.split('').map(char => {
          if (alph[language].includes(char)) {
            let index = alph[language].indexOf(char) + shift;
            while (!alph[language][index]) {
              index -= alph[language].length;
            }
            return alph[language][index];
          } else {
            return char;
          }
        }).join('');

        possibleDecodedPhrases.push(possibleDecodedPhrase);
      }

      this.setState({ decodedText: possibleDecodedPhrases });
    }
  }

  copy(text) {
    Clipboard.setString(text);
    ToastAndroid.showWithGravityAndOffset(
      'Copied to clipboard',
      ToastAndroid.LONG,
      ToastAndroid.TOP,
      25,
      50,
    );
    this.forceUpdate();
  }

  renderClearAndPaste() {
    const { inputText } = this.state;
    return (
      // <TouchableOpacity style={styles.button}>
      <Icon
        style={styles.button}
        name={inputText === '' ? "paste" : "remove"}
        onPress={this.clearOrPaste.bind(this)}
      />
      // </TouchableOpacity>
    );
  }

  renderLang() {
    const { language } = this.state;
    return (
      <TouchableOpacity
        style={styles.button}
        onPress={this.setLang.bind(this)}
      >
        <Text style={styles.centered}>{language.toUpperCase()}</Text>
      </TouchableOpacity>
    );
  }

  render() {
    const { decodedText, inputText } = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.inctructions}>Enter some text below:</Text>
        <View style={styles.controls}>
          <TextInput
            style={styles.input}
            multiline={true}
            onChangeText={text => this.setState({ inputText: text })}
            value={inputText}
          />
          <View style={styles.controlButtonsBlock}>
            {this.renderClearAndPaste()}
            {this.renderLang()}
          </View>
        </View>
        <Text style={styles.inctructions}>Possible variants of Caesar cipher (longpress to copy):</Text>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {typeof decodedText === 'object' ? decodedText.map((text, index) =>
            text ? (
              <TouchableOpacity
                key={index}
                style={styles.touchableView}
                onLongPress={() => this.copy(text)}
              >
                <Text style={styles.codeView}>{index + 1}</Text>
                <Text style={styles.decodedTextView}>
                  {text}
                </Text>
              </TouchableOpacity>
            ) : null
          ) : null}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    paddingLeft: 20,
    paddingRight: 20,
  },
  centered: {
    textAlign: 'center',
  },
  controls: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    height: 100,
  },
  controlButtonsBlock: {
    width: '10%',
    flexDirection: 'column',
  },
  input: {
    height: '100%',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    width: '90%',
    flex: 13,
  },
  button: {
    flex: 1,
    height: 40,
    width: 40,
    padding: 10,
    textAlign: 'center',
    fontSize: 20,
    backgroundColor: '#DDDDDD',
    borderColor: '#CCCCCC',
    borderWidth: 1,
  },
  inctructions: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  decodedTextView: {
    fontSize: 16,
    textAlign: 'left',
    color: '#333333',
    marginBottom: 20,
    width: '100%',
  },
  codeView: {
    fontSize: 16,
    textAlign: 'left',
    color: '#AAAAAA',
    marginRight: 10,
  },
  touchableView: {
    width: '100%',
    flexDirection: 'row',
  },
  scrollContainer: {
    paddingVertical: 10,
    alignItems: 'flex-start',
  }
});
