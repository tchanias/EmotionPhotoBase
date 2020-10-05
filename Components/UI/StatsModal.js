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
        <View style={styles.titleView}>
          <Text style={styles.modalTitle}>Emotion Analysis Results</Text>
          <TouchableOpacity
            onPress={() => {
              setModalVisible(!modalVisible);
            }}
            style={styles.closeIconWrapper}>
            <Icon name="close-outline" style={styles.closeIcon} />
          </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 30,
    minHeight: 80,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    flex: 1,
    backgroundColor: '#009671',
    paddingLeft: 20,
    paddingRight: 20,
  },
  statsModal: {
    overflowY: 'auto',
    backgroundColor: '#fff',
    width: '90%',
    height: '85%',
    borderRadius: 20,
    // border: 10,
    // borderColor: 'yellow',
    padding: 0,
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeIcon: {
    color: 'white',
    fontSize: 30,
  },
  closeButton: {
    backgroundColor: '#009671',
  },
  closeIconWrapper: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    width: 40,
    // position: 'absolute',
    // top: 10,
    // right: 10,
    zIndex: 1,
  },
  ScrollView: {
    // paddingBottom: 30,
    marginBottom: 30,
    paddingLeft: 20,
    paddingRight: 20,
  },
  overlayContentContainer: {
    // paddingTop: 12,
    flex: 1,
    width: '100%',
  },
};
