export class Utils {

    static returnErrorsMap(err: any): any {
        let errors: any = [];

        Object.keys(err.errors).forEach((key) => {
            errors.push (err.errors[key].message);
        });

        return errors
    }

    static getPaginationVariables(query: any) : any{
        
        let {page = 1, limit = 0 } = query

        let skip = (page - 1) * limit

        if(skip < 0){
            skip = 0
        }

        return [page, limit, skip]
    }

}
