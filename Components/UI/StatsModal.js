import React from 'react';
import {View, ScrollView, Text, TouchableOpacity} from 'react-native';
import {Overlay} from 'react-native-elements';
import {sharedStyles} from '../../sharedStyles';
import {Icon} from 'native-base';

export default function StatsModal(props) {
  const {modalVisible, setModalVisible, data} = props;
  return (
    <Overlay
      isVisible={modalVisible}
      //   fullScreen
      overlayStyle={styles.statsModal}
      backdropStyle={styles.backDrop}
      onBackdropPress={() => setModalVisible(!modalVisible)}>
      <View style={styles.overlayContentContainer}>
        <TouchableOpacity
          onPress={() => {
            setModalVisible(!modalVisible);
          }}
          style={styles.closeIconWrapper}>
          <Icon name="close-circle-outline" style={sharedStyles.closeIcon} />
        </TouchableOpacity>
        <View style={styles.titleView}>
          <Text style={styles.modalTitle}>Emotion Scan Results</Text>
        </View>
        <ScrollView style={styles.ScrollView}>{data}</ScrollView>
        {/* <Button
          title="Close"
          buttonStyle={styles.closeButton}
          onPress={() => {
            setModalVisible(!modalVisible);
          }}
        /> */}
      </View>
    </Overlay>
  );
}

const styles = {
  backDrop: {
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  titleView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsModal: {
    overflowY: 'auto',
    backgroundColor: '#fff',
    width: '90%',
    height: '80%',
    borderRadius: 20,
  },
  modalTitle: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeIcon: {
    color: '#009671',
  },
  closeButton: {
    backgroundColor: '#009671',
  },
  closeIconWrapper: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    width: 40,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  ScrollView: {
    // paddingBottom: 30,
    marginBottom: 30,
  },
  overlayContentContainer: {paddingTop: 22},
};
