import express from 'express'
import TodoSchema from '../../schema/todo/todo_schema'
import { Utils } from '../../service/utils'

exports.getAll = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    const [page, limit, skip] = Utils.getPaginationVariables(req.query)

    let scenes = await TodoSchema.find().sort({createdAt: 1})
        .skip(skip)
        .limit(limit);;

    const numOfResults = await TodoSchema.count();

    res.status(200).json({
        status: 200,
        success: true,
        data: scenes,
        currentPage: page,
        pages: Math.ceil(numOfResults / limit),
        numOfResults: numOfResults,
    });

}

exports.getById = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {

        const todo = await TodoSchema.findOne({_id: req.params.id});

        if (!todo) {
            res.status(404).json({
                status: 404,
                success: false,
                message: 'Todo not found',
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            data: todo,
        });

    } catch (err) {

        res.status(400).json({
            status: 400,
            success: false,
            message: err,
        });

    }
}

exports.create = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    try {

        const todo = new TodoSchema(req.body);

        await todo.save();

        res.status(200).json({
            status: 200,
            success: true,
            message: "Todo Created",
            data: todo,
        });

    } catch (err) {

        res.status(400).json({
            status: 400,
            success: false,
            message: Utils.returnErrorsMap(err),
        });

    }

}

exports.update = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    try {

        const todo = await TodoSchema.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: 'Todo not found',
            });
        }

        await TodoSchema!.updateOne({_id: req.params.id}, {$set: req.body});

        const updatedTodo = new TodoSchema(req.body)
        todo.completed = updatedTodo.completed
        todo.title = updatedTodo.title

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Todo Updated",
            data: todo,
        });

    } catch (err) {

        res.status(400).json({
            status: 400,
            success: false,
            message: err,
        });

    }

}

exports.delete = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    try {

        const todo = await TodoSchema.findById(req.params.id);

        if (!todo) {
            res.status(404).json({
                status: 404,
                success: false,
                message: 'Todo not found',
            });
        }

        todo!.deleteOne();

        res.status(200).json({
            status: 200,
            success: true,
            message: "Todo deleted successfully",
        });

    } catch (err) {

        res.status(400).json({
            status: 400,
            success: false,
            message: err,
        });

    }

}



