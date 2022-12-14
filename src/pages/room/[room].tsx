import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import { doc, onSnapshot } from 'firebase/firestore'

import { RoomProps } from '../../core/Room'
import { ResponseProps } from '../../core/Question'
import { Header } from '../../components/Header'
import { BeforeGame } from '../../components/BeforeGame'
import { BoxQuestion } from '../../components/BoxQuestion'
import { AfterGame } from '../../components/AfterGame'
import UseRoom from '../../service/hooks/useRoom'
import { db } from '../../firebase/config'
import UseAuth from '../../service/hooks/useAuth'

import logoQuestion from '../../../public/images/logoQuestion.svg'
import styles from '../../styles/room.module.css'

export default function Room() {
	const id = useRouter().query.room
	const { user } = UseAuth()
	const {
		getRoom,
		joinRoom,
		startGame,
		getQuestion,
		nextQuestion,
		countPoints
	} = UseRoom()
	const [room, setRoom] = useState<RoomProps>({
		id: '',
		leader: '',
		players: [{
			email: '',
			name: '',
			photo: '',
			score: 0,
			xp: 0
		}],
		playersLength: 0,
		playing: false,
		title: '',
		questionNumber: 0,
		question: {
			answer: [],
			enunciation: '',
			id: 0
		}
	})
	const [questionSelected, setQuestionSelected] = useState<ResponseProps | null>(null)

	async function getRoomValues() {
		const roomFound = await getRoom(id as string ?? '')

		if (roomFound.leader) {
			onSnapshot(doc(db, "rooms", roomFound.leader), (doc) => {
				setRoom(doc.data() as RoomProps)
			})
		}
	}

	async function enterTheRoom() {
		await joinRoom(room.leader, {
			email: user.email,
			name: user.name,
			photo: user.photo,
			score: 0,
			xp: 0
		})
	}

	async function getNowQuestion() {
		await getQuestion(room)
	}

	async function countAndNextQuestion() {
		await countPoints(
			questionSelected?.correct ?? false,
			user.email,
			room.leader
		)

		await nextQuestion(room.leader)
	}

	function renderQuestionsAndPlayers() {
		if (room.playing && room.question.answer[2]) {
			return (
				<div className={styles.contentGeralQuestionBox}>
					<div className={styles.contentQuestionBox}>
						<div className={styles.contentQuestion}>
							<div className={styles.contentQuestionNow}>
								<h1>{room.question.enunciation}</h1>
							</div>
							<Image src={logoQuestion} height={60} width={100} style={{ width: '20%', marginRight: '10px' }} alt='Logo' />
						</div>
						<div className={styles.contentTimer}>
							<CountdownCircleTimer
								duration={60}
								size={100}
								isPlaying
								colors={['#3c2765', '#F7B801', '#A30000', '#A30000']}
								colorsTime={[30, 20, 10, 5]}
							>
								{({ remainingTime }) => remainingTime}
							</CountdownCircleTimer>
						</div>
						<div className={styles.contentAreaAnswers}>
							<BoxQuestion
								text={room.question.answer[0].value}
								numberQuestion={1}
								onClick={() => {
									setQuestionSelected(room.question.answer[0])
									countAndNextQuestion()
								}}
								selected={questionSelected === room.question.answer[0]}
							/>
							<BoxQuestion
								text={room.question.answer[1].value}
								numberQuestion={2}
								onClick={() => {
									setQuestionSelected(room.question.answer[1])
									countAndNextQuestion()
								}}
								selected={questionSelected === room.question.answer[1]}
							/>
							<BoxQuestion
								text={room.question.answer[2].value}
								numberQuestion={3}
								onClick={() => {
									setQuestionSelected(room.question.answer[2])
									countAndNextQuestion()
								}}
								selected={questionSelected === room.question.answer[2]}
							/>
						</div>
					</div>
				</div>
			)
		} else if (room.playing) {
			return (
				<div>
					<AfterGame
						players={room.players}
					/>
				</div>
			)
		} else {
			return (
				<BeforeGame
					title={room.title}
					leader={room.leader === user.email ? true : false}
					players={room.players}
					enterTheRoom={enterTheRoom}
					roomLength={room.playersLength}
					onClick={() => startGame(room.leader)}
					playing={room.playing}
				/>
			)
		}
	}

	useEffect(() => {
		getRoomValues()

	}, [id])

	useEffect(() => {
		getNowQuestion()

	}, [room])

	return (
		<div className={styles.contentGeral}>
			<Header />
			{renderQuestionsAndPlayers()}
		</div>
	)
}
