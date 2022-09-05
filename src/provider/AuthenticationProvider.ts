import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"
import { addDoc, collection, getDocs, query, where } from "firebase/firestore"
import Cookie from 'js-cookie'

import { auth, db } from '../firebase/config'
import { ProviderProps } from "../core/Provider"
import { User } from "../core/User"

export default class AuthenticationProvider implements ProviderProps {

	private _provider = new GoogleAuthProvider()
	private _user = new User({
		photo: '',
		email: '',
		name: ''
	})

	async loginGoogle(): Promise<User> {
		console.log('login google')
		const login = await signInWithPopup(auth, this._provider)

		return this._user.clone({
			name: login.user.displayName ?? '',
			email: login.user.email ?? '',
			photo: login.user.photoURL ?? ''
		})
	}

	async getUser(user: User): Promise<User | false> {
		const searchedUser = query(collection(db, 'users'), where('email', '==', user.email))

		const resolveQuery = await getDocs(searchedUser)

		await resolveQuery.forEach((doc) => console.log(doc.data()))

		return resolveQuery.empty ? false : user
	}

	async submitUser(user: User): Promise<void> {
		await addDoc(collection(db, "users"), {
			name: user.name,
			email: user.email,
			photo: user.photo
		})
		console.log("Submitted")
	}

	async logout(): Promise<void> {
		console.log('Logout')
		await signOut(auth)
	}

	static setCookieUser(user: User) {
		Cookie.set('Admin-QuizDev', user.email, { expires: 7 })
	}
}