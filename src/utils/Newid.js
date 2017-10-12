let lastId = 0

export default function (prefix = 'red-face-') {
	lastId++
	return `${prefix}${lastId}`
}