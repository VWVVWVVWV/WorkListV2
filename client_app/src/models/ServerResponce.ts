import Todo from './Todo'
export default class SeverResponce{
    sort_type: string="desc"
    sort_field: string="task_id"
    task_page: number=1
    pages: number=1
    todos:Todo[]= []
}