const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  options: {
    type: [String],
    required: true,
    validate: [arr => arr.length >= 2, 'Question must have at least 2 options'],
  },
  correctAnswer: {
    type: Number,
    required: [true, 'Correct option index is required'],
    min: 0,
  },
  marks: {
    type: Number,
    default: 1,
    min: 1,
  },
  explanation: {
    type: String,
    trim: true,
    default: '',
  },
});

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Exam title is required'],
      trim: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    subjectName: {
      type: String,
      required: true,
      trim: true,
    },
    classGrade: {
      type: String,
      trim: true,
      default: 'General',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: 1,
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks are required'],
      min: 1,
    },
    passingMarks: {
      type: Number,
      required: [true, 'Passing marks are required'],
      min: 1,
    },
    scheduleStart: {
      type: Date,
      default: Date.now,
    },
    scheduleEnd: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    allowRetake: {
      type: Boolean,
      default: false,
    },
    questions: [questionSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Method to sanitize questions for students taking the exam (strip correctAnswer & explanation)
examSchema.methods.toStudentView = function () {
  const exam = this.toObject();
  if (exam.questions && Array.isArray(exam.questions)) {
    exam.questions = exam.questions.map(q => {
      const { correctAnswer, explanation, ...safeQuestion } = q;
      return safeQuestion;
    });
  }
  return exam;
};

module.exports = mongoose.model('Exam', examSchema);
