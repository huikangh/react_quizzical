import React from "react"
import Quiz from "./Quiz"
import { nanoid } from "nanoid";
import { decode } from 'html-entities';


export default function QuizPage(props) {

    const [quizData, setQuizData] = React.useState([])
    const [quizzes, setQuizzes] = React.useState([])
    const [score, setScore] = React.useState(-1)

    React.useEffect(() => {
        /* parse game option from gameOption state and generate the url*/
        const amount = `amount=${props.gameOption.amount}`
        const category = props.gameOption.category ? `&category=${props.gameOption.category}` : ``
        const type = props.gameOption.type ? `&type=${props.gameOption.type}` : ``
        const difficulty = `&difficulty=${props.gameOption.difficulty}`
        const APIurl = "https://opentdb.com/api.php?" + amount + category + difficulty + type

        fetch(APIurl)
            .then(res => res.json())
            .then(data => setQuizData(data.results))
    }, [])

    React.useEffect(() => {
        setQuizzes(
            quizData.map(data => {
                return {
                    id: nanoid(),
                    question: decode(data.question),
                    correct: decode(data.correct_answer),
                    incorrects: data.incorrect_answers.map(ia => decode(ia)),
                    choices: shuffle([data.correct_answer, ...data.incorrect_answers]).map(ia => decode(ia)),
                    selected: "",
                    gameOver: false
                }
            })
        )
    }, [quizData])

    /*  source: Fisher-Yates Shuffle */
    function shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    function changeSelected(event, id) {
        const selectedChoice = event.target.innerText
        setQuizzes(prevQuizzes =>
            prevQuizzes.map(quiz =>{
                return id === quiz.id ? {...quiz, selected: selectedChoice} : quiz
            })
        )
    }

    function checkAnswers() {
        setQuizzes(prevQuizzes => prevQuizzes.map(
            quiz => ({...quiz, gameOver: true})
        ))

        let temp = 0
        for (let i=0; i<quizzes.length; i++) {
            let quiz = quizzes[i]
            if (quiz.selected === quiz.correct) {
                temp += 1
            }
        }
        setScore(temp)
    }

    const quizElements = quizzes.map(quiz => {
        return (
            <Quiz 
                key = {quiz.id}
                question = {quiz.question} 
                correct = {quiz.correct}
                incorrects = {quiz.incorrects}
                choices = {quiz.choices}
                selected = {quiz.selected}
                gameOver = {quiz.gameOver}
                changeSelected = {(event)=>changeSelected(event, quiz.id)}
            />
        )
    })

    return (
        <div className="game--div">
            <div className="game--title">Quizzical</div>
            <div className="game--desc">
                {props.gameOption.categoryName} - {capitalize(props.gameOption.difficulty)}
            </div>
            <div className="quiz--div"> {quizElements} </div>

            <div className="game--footer">
            {score === -1 ? 
                <div className="answer--button" onClick={checkAnswers}>Check Answers</div> :
                <div className="game--result">
                    <h3>You scored {score}/{props.gameOption.amount} correct answers!</h3>
                    <div className="reset--button" onClick={props.changeGameState}>New Game</div>
                </div>
            }
            </div>
        </div>
    )
}