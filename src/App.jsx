import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRpr0OtCl2zDzkpcrCv9qLn8sci1jQiqM3lxkgjfejSawbt9x6UFklo3Zt-_6acp04qFkCnO6j59KKg/pub?output=csv";

function App() {
  const [quizData, setQuizData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchSheetData = async () => {
      try {
        const response = await fetch(GOOGLE_SHEET_CSV_URL);
        
        // [수정된 부분] 복잡한 reader 대신 text() 메서드 사용
        // 이 함수는 모든 데이터가 다 받아질 때까지 자동으로 기다려줍니다.
        const csv = await response.text(); 

        // 배열을 무작위로 섞는 함수
        const shuffleArray = (array) => {
          let currentIndex = array.length, randomIndex;
          while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
          }
          return array;
        };

        Papa.parse(csv, {
          header: false, 
          skipEmptyLines: true,
          complete: (results) => {
            // 헤더 제거
            const rows = results.data.slice(1);
            // 섞기
            const shuffled = shuffleArray(rows);
            
            console.log("전체 데이터 개수:", shuffled.length); // 콘솔에서 개수 확인 가능
            setQuizData(shuffled);
            setLoading(false);
          },
        });
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    fetchSheetData();
  }, []);


  // 다음 문제로 넘어가는 함수
  const handleNext = () => {
    setShowAnswer(false); // 정답 가리기
    // 인덱스를 증가시키되, 마지막 문제라면 처음(0)으로 돌아가거나 종료 처리
    setCurrentIndex((prev) => (prev + 1) % quizData.length);
  };

  if (loading) return <div style={styles.container}>로딩 중...</div>;
  if (quizData.length === 0) return <div style={styles.container}>데이터가 없습니다.</div>;

  // 현재 보여줄 카드 데이터 (배열 형태: [A열, B열, C열, D열...])
  const currentCard = quizData[currentIndex];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.progress}>
          문제 {currentIndex + 1} / {quizData.length}
        </div>

        {/* A열: 메인 질문/단어 */}
        <h1 style={styles.question}>{currentCard[1]}</h1>

        {/* B열: 힌트/부가설명 */}
        <p style={styles.hint}>{currentCard[2]}</p>

        <hr style={styles.divider} />

        {/* C열: 정답 (버튼을 눌러야 보임) */}
        <div style={styles.answerSection}>
          {!showAnswer ? (
            <button onClick={() => setShowAnswer(true)} style={styles.revealButton}>
              정답 확인
            </button>
          ) : (
            <div style={styles.answerBox}>
              <span style={styles.answerLabel}>정답</span>
              <h2 style={styles.answerText}>{currentCard[3]}</h2>
            </div>
          )}
        </div>

        {/* 다음 문제 버튼 (항상 보임) */}
        <button onClick={handleNext} style={styles.nextButton}>
          다음 카드 &rarr;
        </button>
      </div>
    </div>
  );
}

// 간단한 스타일 객체
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    fontFamily: 'sans-serif',
    width: '100vw',
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    textAlign: 'center',
    width: '90%',
    maxWidth: '400px',
  },
  progress: {
    color: '#888',
    fontSize: '14px',
    marginBottom: '20px',
  },
  question: {
    fontSize: '28px',
    color: '#333',
    marginBottom: '10px',
  },
  hint: {
    fontSize: '16px',
    color: '#666',
    fontStyle: 'italic',
    marginBottom: '30px',
  },
  divider: {
    border: '0',
    borderTop: '1px solid #eee',
    margin: '20px 0',
  },
  answerSection: {
    minHeight: '80px', // 정답 영역 높이 고정 (레이아웃 흔들림 방지)
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  revealButton: {
    padding: '10px 20px',
    width: '200px',
    fontSize: '16px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  answerBox: {
    animation: 'fadeIn 0.3s ease-in',
  },
  answerLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#888',
    marginBottom: '5px',
  },
  answerText: {
    margin: 0,
    color: '#27ae60',
  },
  nextButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: '1px solid #ccc',
    borderRadius: '5px',
    cursor: 'pointer',
    width: '200px',
    color: '#333',
  },
};

export default App;