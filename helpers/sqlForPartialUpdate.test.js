const {sqlForPartialUpdate: sql} = require('./sql')
const {BadRequestError} = require("../expressError");
describe('sqlForPartialUpdate', () => {
    test('no data throws Error', () => {
        expect(() => sql({}, {})).toThrow(BadRequestError)
    })
    test('single key to update same name', () => {
        const updates = {hello: '3'}, renames = {}
        const {setCols, values} = sql(updates, renames)
        expect(setCols).toEqual(`hello=$1`)
        expect(values).toEqual(['3'])
    })
    test('single key to update different name', () => {
        const updates = {one: 1}, renames = {one: "ONE"}
        const {setCols, values} = sql(updates, renames)
        expect(setCols).toEqual(`ONE=$1`)
        expect(values).toEqual([1])
    })
    test('multiple keys to update all same names', () => {
        const updates = {one: 1, two: 2}, renames = {}
        const {setCols, values} = sql(updates, renames)
        expect(setCols).toEqual(`one=$1, two=$2`)
        expect(values).toEqual([1, 2])
    })
    test('multiple keys to update mixed same/different names', () => {
        const updates = {one: 1, two: 2}, renames = {one: "ONE"}
        const {setCols, values} = sql(updates, renames)
        expect(setCols).toEqual(`ONE=$1, two=$2`)
        expect(values).toEqual([1, 2])
    })
})
