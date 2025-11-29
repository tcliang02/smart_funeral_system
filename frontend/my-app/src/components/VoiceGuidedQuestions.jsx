import React, { useState } from 'react';
import { MessageCircle, Lightbulb, ArrowRight, Check } from 'lucide-react';
import './VoiceGuidedQuestions.css';

const VoiceGuidedQuestions = ({ onAddMemory }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [answers, setAnswers] = useState({});

  const questionCategories = [
    {
      id: 'speech_patterns',
      title: 'How They Spoke',
      icon: '💬',
      description: 'Help us capture their unique voice and expressions',
      questions: [
        {
          id: 'greeting',
          question: 'How did they usually greet family members?',
          placeholder: 'e.g., "Ah boy/ah girl, have you eaten?" or "Come here, give mama a hug!"',
          example: 'They always said "Eh, you\'re back ah?" with a warm smile'
        },
        {
          id: 'comfort',
          question: 'What would they say when comforting someone who was upset?',
          placeholder: 'e.g., "Don\'t cry la, everything will be okay" or "Come, tell me what happened"',
          example: 'They would pat my shoulder and say "Aiya, don\'t worry so much, we figure it out together"'
        },
        {
          id: 'advice',
          question: 'What advice did they often give? How did they phrase it?',
          placeholder: 'e.g., "Always remember to..." or "In life, you must..."',
          example: 'Dad always said "Work hard, but don\'t forget to enjoy life. Money can earn back, time cannot"'
        },
        {
          id: 'sayings',
          question: 'What were their favorite sayings, phrases, or expressions?',
          placeholder: 'e.g., "Haiya!", "Like that also can?", "Nevermind la"',
          example: 'She always said "Aiyo!" when surprised and "Slowly slowly" when we rushed'
        }
      ]
    },
    {
      id: 'reactions',
      title: 'Their Reactions',
      icon: '😊',
      description: 'How they responded to different situations',
      questions: [
        {
          id: 'good_news',
          question: 'How would they react to good news?',
          placeholder: 'e.g., "Wah! Really ah? So good!" or "I knew you could do it!"',
          example: 'Mom would clap her hands and say "See! I told you, you can do it one!" with tears of joy'
        },
        {
          id: 'proud',
          question: 'Tell us about a time they were really proud. What did they say?',
          placeholder: 'Describe a specific moment and their exact words',
          example: 'When I graduated, dad said "Today I am the happiest father. You make me so proud." His voice was shaking.'
        },
        {
          id: 'humor',
          question: 'What made them laugh? What jokes did they tell?',
          placeholder: 'Share their sense of humor and funny moments',
          example: 'She loved puns in Hokkien and would giggle at her own jokes, saying "You see, funny right?"'
        },
        {
          id: 'worried',
          question: 'When they were worried about you, what would they say?',
          placeholder: 'e.g., "Did you eat properly?", "Drive carefully ah!"',
          example: 'Every time I left the house: "Bring umbrella, bring water, call me when you reach"'
        }
      ]
    },
    {
      id: 'values',
      title: 'What They Valued',
      icon: '❤️',
      description: 'Their beliefs, principles, and what mattered most',
      questions: [
        {
          id: 'important',
          question: 'What was most important to them in life?',
          placeholder: 'Family? Faith? Education? Hard work?',
          example: 'Family was everything. He always said "Money gone can earn back, family cannot replace"'
        },
        {
          id: 'taught',
          question: 'What life lessons did they teach you? Use their own words.',
          placeholder: 'Specific lessons and how they expressed them',
          example: 'Mom taught me "Respect everyone, no matter rich or poor. We all same same." She lived by this.'
        },
        {
          id: 'faith',
          question: 'If they were religious/spiritual, what did they believe? How did they talk about it?',
          placeholder: 'Their faith and how they expressed it',
          example: 'Buddhist. She would say "念经不是迷信，是让心平静" (Chanting isn\'t superstition, it calms the mind)'
        }
      ]
    },
    {
      id: 'daily_life',
      title: 'Everyday Moments',
      icon: '🏠',
      description: 'The small, special things that made them unique',
      questions: [
        {
          id: 'morning',
          question: 'How did they start their mornings? What would they say?',
          placeholder: 'Morning routines and typical phrases',
          example: 'Dad woke up at 5am, made coffee, read the Chinese newspaper. He\'d say "早安！起来了？" (Morning! You\'re up?)'
        },
        {
          id: 'food',
          question: 'How did they talk about food? Any special phrases?',
          placeholder: 'Food-related memories and their expressions',
          example: 'She loved cooking. When serving: "Eat more, you too skinny already!" Even if we just ate.'
        },
        {
          id: 'care',
          question: 'How did they show they cared? What small things did they do or say?',
          placeholder: 'Acts of love and care they showed',
          example: 'Would text "Have you eaten?" every day at lunch. That was her way of saying I love you.'
        }
      ]
    }
  ];

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSaveAnswer = (question) => {
    const answer = answers[question.id];
    if (!answer || answer.trim().length < 10) {
      alert('Please provide a more detailed answer (at least 10 characters)');
      return;
    }

    // Convert answer into memory format
    const memory = {
      type: 'story',
      title: question.question,
      content: answer,
      importance: 'high',
      source: 'guided_question'
    };

    onAddMemory(memory);
    
    // Clear the answer
    setAnswers(prev => {
      const updated = { ...prev };
      delete updated[question.id];
      return updated;
    });

    alert('✅ Answer saved! This will help train the AI voice.');
  };

  return (
    <div className="voice-guided-questions">
      <div className="guided-intro">
        <Lightbulb size={32} className="intro-icon" />
        <div>
          <h3>🎯 Better Voice Training Through Questions</h3>
          <p>
            Instead of generic examples, we ask YOU specific questions. Your answers become the AI's training data.
            The more detailed and specific you are, the more authentic the voice will sound!
          </p>
        </div>
      </div>

      <div className="category-tabs">
        {questionCategories.map(cat => (
          <button
            key={cat.id}
            className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span className="cat-icon">{cat.icon}</span>
            <span>{cat.title}</span>
          </button>
        ))}
      </div>

      {selectedCategory && (
        <div className="questions-section">
          {questionCategories
            .find(c => c.id === selectedCategory)
            ?.questions.map(q => (
              <div key={q.id} className="question-card">
                <div className="question-header">
                  <MessageCircle size={20} />
                  <h4>{q.question}</h4>
                </div>
                
                <div className="example-hint">
                  <span className="hint-label">💡 Example:</span>
                  <span className="hint-text">{q.example}</span>
                </div>

                <textarea
                  className="answer-input"
                  placeholder={q.placeholder}
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  rows={4}
                />

                <button
                  className="save-answer-btn"
                  onClick={() => handleSaveAnswer(q)}
                  disabled={!answers[q.id] || answers[q.id].trim().length < 10}
                >
                  <Check size={18} />
                  Save Answer
                  <ArrowRight size={18} />
                </button>
              </div>
            ))}
        </div>
      )}

      {!selectedCategory && (
        <div className="select-category-prompt">
          <p>👆 Select a category above to start answering questions</p>
        </div>
      )}
    </div>
  );
};

export default VoiceGuidedQuestions;
