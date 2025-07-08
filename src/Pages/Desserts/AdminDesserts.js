import React, { useState, useEffect } from 'react'
import { getAllDesserts, createDessert } from '../../APIFunctions/Desserts';



export default function AdminDesserts(props) {
	const [desserts, setDesserts] = useState([]);
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [calories, setCalories] = useState(null);

	async function getDessertsFromDB() {
		const dessertsFromDB = await getAllDesserts();
		if (!dessertsFromDB.error) {
				setDesserts(dessertsFromDB.responseData);
		}
	}

	useEffect(() => {
		getDessertsFromDB();
	}, []);
    

	const INPUT_CLASS = 'indent-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 text-white';

	return (
		
	<div className='m-10'>
		<h1 className="text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
			Welcome to the Dessert Admin Page!!
		</h1>
		<div className='mt-10 grid grid-cols-1 gap-x-6 gap-y-8 grid-cols-full md:grid-cols-3'>
			<div>
				<label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-300">
					Dessert Name
				</label>
				<input
					type="text"
					name="name"
					id="name"
					placeholder="For example, Ice Cream"
					value={name}
					onChange={e => setName(e.target.value)}
					className={INPUT_CLASS}
				/>

			</div>
			<div>
				<label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-300">
					Dessert Description
				</label>
				<input
					type="text"
					name="description"
					id="description"
					placeholder="For example: Strawberry, Matcha, Chocolate"
					value={description}
					onChange={ e => setDescription(e.target.value)}
					className={INPUT_CLASS}
				/>
			</div>
			<div>
				<label htmlFor="calories" className="block text-sm font-medium leading-6 text-gray-300">
					Dessert Calories
				</label>
				<input
					type="text"
					name="calories"
					id="calories"
					placeholder="For example: 300, 450, 225"
					value={calories}
					onChange={ e => setCalories(e.target.value)}
					className={INPUT_CLASS}
				/>
			</div>
			<div className='col-span-full sm:col-span-4'>
				<button
					type='submit'
					className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
					onClick={() => createDessert({
						name,
						description,
						calories
					}, props.user.token)}
					
				>
					Submit
				</button>
			</div>
		</div>


		<div className="relative overflow-x-auto mt-10">
			<table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
				<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
					<tr>
						<th scope="col" className="px-6 py-3">
							Dessert name
						</th>
						<th scope="col" className="px-6 py-3">
							Description
						</th>
						<th scope="col" className="px-6 py-3">
							Calories
						</th>
					</tr>
				</thead>
				<tbody>
					{desserts.map((dessert) => {
						return (
							<tr key={dessert._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
								<th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
									{dessert.name}
								</th>
								<td className="px-6 py-4">
									{dessert.description}
								</td>
								<td className="px-6 py-4">
									{dessert.calories}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>

	</div>
	);
}