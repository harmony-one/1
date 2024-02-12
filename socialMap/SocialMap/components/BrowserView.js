import InAppBrowser from 'react-native-inappbrowser-reborn';

const openInAppBrowser = async (url) => {
  try {
    if (await InAppBrowser.isAvailable()) {
      const result = await InAppBrowser.open(url, {
        // Android Properties
        showTitle: true,
        toolbarColor: '#00ace8',
        // iOS Properties
        dismissButtonStyle: 'cancel',
        preferredBarTintColor: '#00ace8',
        preferredControlTintColor: 'white',
        readerMode: false,
        animated: true,
        modalPresentationStyle: 'fullScreen',
        modalTransitionStyle: 'coverVertical',
        modalEnabled: true,
        enableBarCollapsing: false,
        // Specify full-screen animation options
        animations: {
          startEnter: 'slide_in_up',
          startExit: 'slide_out_down',
          endEnter: 'slide_in_up',
          endExit: 'slide_out_down',
        },
      });
      console.log(result);
    }
  } catch (error) {
    console.log(error.message);
  }
};

export default openInAppBrowser;