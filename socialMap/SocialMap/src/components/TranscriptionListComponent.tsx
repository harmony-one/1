import React from 'react';
import {View, Text} from 'react-native';

interface TranscriptionListComponentProps {
  transcriptions: string[];
}

const TranscriptionListComponent: React.FC<TranscriptionListComponentProps> = ({
  transcriptions,
}) => {
  return (
    <View>
      <Text>{transcriptions[0]}</Text>
    </View>
  );
};

export default TranscriptionListComponent;
