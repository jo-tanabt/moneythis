import { useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { expenseAPI, categoryAPI } from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'

const ExpenseForm = ({ onSuccess, initialData = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: categories } = useQuery(
    'categories',
    () => categoryAPI.getCategories(),
    { select: data => data.data }
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      amount: initialData?.amount || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      merchant: initialData?.merchant || '',
      date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: initialData?.notes || ''
    }
  })

  const createMutation = useMutation(
    (data) => expenseAPI.createExpense(data),
    {
      onSuccess: () => {
        toast.success('Expense created successfully!')
        reset()
        onSuccess()
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create expense')
      },
      onSettled: () => {
        setIsSubmitting(false)
      }
    }
  )

  const onSubmit = (data) => {
    setIsSubmitting(true)
    createMutation.mutate({
      ...data,
      amount: parseFloat(data.amount)
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-notion-text mb-2">
            Amount *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('amount', { 
              required: 'Amount is required',
              min: { value: 0.01, message: 'Amount must be greater than 0' }
            })}
            className="notion-input"
            placeholder="0.00"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-notion-text mb-2">
            Date *
          </label>
          <input
            type="date"
            {...register('date', { required: 'Date is required' })}
            className="notion-input"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-notion-text mb-2">
          Description *
        </label>
        <input
          type="text"
          {...register('description', { required: 'Description is required' })}
          className="notion-input"
          placeholder="What did you spend money on?"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-notion-text mb-2">
            Category *
          </label>
          <select
            {...register('category', { required: 'Category is required' })}
            className="notion-select"
          >
            <option value="">Select a category</option>
            {categories?.map((category) => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-notion-text mb-2">
            Merchant
          </label>
          <input
            type="text"
            {...register('merchant')}
            className="notion-input"
            placeholder="Where did you shop?"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-notion-text mb-2">
          Notes
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className="notion-input"
          placeholder="Additional notes or details..."
        />
      </div>

      <div className="flex items-center justify-end space-x-4">
        <button
          type="button"
          onClick={() => reset()}
          className="notion-button-secondary"
          disabled={isSubmitting}
        >
          Clear
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="notion-button-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isSubmitting && <LoadingSpinner size="small" />}
          <span>Create Expense</span>
        </button>
      </div>
    </form>
  )
}

export default ExpenseForm