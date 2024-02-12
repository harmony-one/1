import React from 'react';
import {View, Text} from 'react-native';

interface PostsComponentProps {
  transcriptions: string[];
}

const PostsComponent: React.FC<PostsComponentProps> = ({transcriptions}) => {
  return (
    <View>
      <Text>{transcriptions[0]}</Text>
    </View>
  );
};

export default PostsComponent;
