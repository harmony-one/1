import * as FileSystem from 'expo-file-system'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: 'OPENAI' })

export async function speechToText (filePath) {

  // need to make the openai call on the backend. Working on that

  console.log(filePath)
  const stream = await FileSystem.readAsStringAsync(filePath, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const result = await openai.audio.transcriptions.create({
    file: stream,
    model: 'whisper-1'
  })
  return result.text
}


