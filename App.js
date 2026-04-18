// App.js
// Correct answers for sample data:
// Q1: choice 1 (index 0)
// Q2: choices 1 and 3 (indices [0, 2])
// Q3: choice 2 (index 1)

import React, { useState } from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ButtonGroup } from 'react-native-elements';

const Stack = createStackNavigator();

const QUESTIONS = [
  {
    prompt: 'What hogwarts house is Harry Potter in?',
    type: 'multiple-choice',
    choices: ['Gryffindor', 'Slytherin', 'Hufflepuff', 'Ravenclaw'],
    correct: 0,
  },
  {
    prompt: 'What colors represents the slytherin hogwarts house?',
    type: 'multiple-answer',
    choices: ['Silver', 'Red', 'Green', 'Gold'],
    correct: [0, 2],
  },
  {
    prompt: 'There are 8 horocruxes',
    type: 'true-false',
    choices: ['True', 'False'],
    correct: 1,
  },
];

function Question({ route, navigation }) {
  const { data, index, answersSoFar = [] } = route.params;
  const question = data[index];

  const isMultiAnswer = question.type === 'multiple-answer';

  const [selectedIndex, setSelectedIndex] = useState(
    isMultiAnswer ? [] : null
  );

  const handleSelect = (selected) => {
    if (isMultiAnswer) {
      setSelectedIndex(selected); // ButtonGroup with selectMultiple gives array
    } else {
      setSelectedIndex(selected);
    }
  };

  const hasSelection =
    isMultiAnswer ? selectedIndex.length > 0 : selectedIndex !== null;

  const handleNext = () => {
    if (!hasSelection) return;

    const answerRecord = {
      selected: isMultiAnswer ? [...selectedIndex].sort() : selectedIndex,
    };

    const newAnswers = [...answersSoFar, answerRecord];

    if (index + 1 < data.length) {
      navigation.push('Question', {
        data,
        index: index + 1,
        answersSoFar: newAnswers,
      });
    } else {
      navigation.navigate('Summary', {
        data,
        answers: newAnswers,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.questionContainer}>
        <Text style={styles.prompt}>
          {`Question ${index + 1} of ${data.length}`}
        </Text>
        <Text style={styles.prompt}>{question.prompt}</Text>

        <ButtonGroup
          testID="choices"
          buttons={question.choices}
          vertical
          onPress={handleSelect}
          selectMultiple={isMultiAnswer}
          selectedIndex={isMultiAnswer ? undefined : selectedIndex}
          selectedIndexes={isMultiAnswer ? selectedIndex : undefined}
          containerStyle={styles.buttonGroup}
        />

        <View style={styles.nextButton}>
          <Button
            testID="next-question"
            title={index + 1 === data.length ? 'Finish Quiz' : 'Next Question'}
            onPress={handleNext}
            disabled={!hasSelection}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function Summary({ route }) {
  const { data, answers } = route.params;

  const isCorrect = (question, answerRecord) => {
    const correct = question.correct;
    const selected = answerRecord.selected;

    if (Array.isArray(correct)) {
      if (!Array.isArray(selected)) return false;
      const sortedCorrect = [...correct].sort();
      const sortedSelected = [...selected].sort();
      if (sortedCorrect.length !== sortedSelected.length) return false;
      return sortedCorrect.every((v, i) => v === sortedSelected[i]);
    } else {
      return selected === correct;
    }
  };

  const totalScore = data.reduce((score, q, idx) => {
    return score + (isCorrect(q, answers[idx]) ? 1 : 0);
  }, 0);

  const renderChoiceStyle = (question, answerRecord, choiceIndex) => {
    const correct = question.correct;
    const selected = answerRecord.selected;

    const isCorrectChoice = Array.isArray(correct)
      ? correct.includes(choiceIndex)
      : correct === choiceIndex;

    const userSelected = Array.isArray(selected)
      ? selected.includes(choiceIndex)
      : selected === choiceIndex;

    const style = [styles.choiceText];

    // Bold all correct answers
    if (isCorrectChoice) {
      style.push(styles.correctChoice);
    }

    // Strikethrough incorrect chosen answers
    if (userSelected && !isCorrectChoice) {
      style.push(styles.incorrectChosen);
    }

    return style;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.summaryContainer}>
        <Text testID="total" style={styles.totalScore}>
          Total Score: {totalScore} / {data.length}
        </Text>

        {data.map((q, idx) => {
          const answerRecord = answers[idx];
          const correctFlag = isCorrect(q, answerRecord);

          return (
            <View key={idx} style={styles.summaryQuestion}>
              <Text style={styles.summaryPrompt}>
                {`Q${idx + 1}: ${q.prompt}`}
              </Text>
              <Text style={correctFlag ? styles.correctLabel : styles.incorrectLabel}>
                {correctFlag ? 'Correct' : 'Incorrect'}
              </Text>

              {q.choices.map((choice, cIdx) => (
                <Text
                  key={cIdx}
                  style={renderChoiceStyle(q, answerRecord, cIdx)}
                >
                  {choice}
                </Text>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Question">
        <Stack.Screen
          name="Question"
          component={Question}
          initialParams={{ data: QUESTIONS, index: 0, answersSoFar: [] }}
          options={{ title: 'Quiz' }}
        />
        <Stack.Screen
          name="Summary"
          component={Summary}
          options={{ title: 'Summary' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Export components from App.js as required
export { Question, Summary };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  questionContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-start',
  },
  prompt: {
    fontSize: 18,
    marginBottom: 12,
  },
  buttonGroup: {
    marginTop: 16,
  },
  nextButton: {
    marginTop: 24,
  },
  summaryContainer: {
    padding: 16,
  },
  totalScore: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryQuestion: {
    marginBottom: 24,
  },
  summaryPrompt: {
    fontSize: 16,
    marginBottom: 4,
  },
  correctLabel: {
    color: 'green',
    marginBottom: 4,
  },
  incorrectLabel: {
    color: 'red',
    marginBottom: 4,
  },
  choiceText: {
    fontSize: 14,
    marginLeft: 8,
  },
  correctChoice: {
    fontWeight: 'bold',
  },
  incorrectChosen: {
    textDecorationLine: 'line-through',
  },
});