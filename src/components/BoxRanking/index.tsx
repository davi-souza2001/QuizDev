import Image from 'next/image'

import Test from '../../../public/images/testUser.jpg'
import styles from './BoxRanking.module.css'

interface BoxRankingProps {
	rank: 'first' | 'second' | 'third'
}

export function BoxRanking(props: BoxRankingProps) {
	return (
		<div className={styles.contentGeral}>
			<div className={styles.contentImage}>
				<Image src={Test} height={35} width={35} style={{ borderRadius: '9999px', marginRight: '10px' }} />
			</div>
			<h1>Davi Souza</h1>
			<p>{props.rank === 'first' && '🥇'}</p>
			<p>{props.rank === 'second' && '🥈'}</p>
			<p>{props.rank === 'third' && '🥉'}</p>
		</div>
	)
}