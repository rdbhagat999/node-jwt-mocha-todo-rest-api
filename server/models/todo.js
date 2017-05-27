var mongoose = require('mongoose');

let Todo = mongoose
				.model('Todo', {
					text: {
						type: String,
						required: true,
						minlength: [6, 'Minimum length must be 6'],
						trim: true
					},
					isCompleted: {
						type: Boolean,
						default: false
					},
					completedAt: {
						type: Number,
						default: null
					},
					_userId: {
						type: mongoose.Schema.Types.ObjectId,
						required: true
					}
				});


module.exports = {
	Todo:Todo
}