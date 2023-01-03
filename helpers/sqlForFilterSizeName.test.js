const factory = (minEmployees, maxEmployees, name) => ({minEmployees, maxEmployees, name})
const sql = require('./sqlForFilterSizeName')
const u = undefined;
describe('filter helper function for companies', () => {
    describe('one filter', () => {
        test('just min', () => {
            const args = factory(1)
            const [str,vals ,count]= sql(args)
            expect(str).toBe(`WHERE num_employees >= $1`)
            expect(vals).toEqual([1])
            expect(count).toBeTruthy()
        })
        test('just max', () => {
            const args = factory(u,2,u )
            const [str,vals ,count]= sql(args)
            expect(str).toBe(`WHERE num_employees <= $1`)
            expect(vals).toEqual([2])
            expect(count).toBeTruthy()
        })
        test('just name', () => {
            const args = factory(u,u,'h')
            const [str,vals ,count]= sql(args)
            expect(str).toBe(`WHERE name ILIKE $1`)
            expect(vals).toEqual(['%h%'])
            expect(count).toBeFalsy()
        })
    })
    describe('two filters', () => {
        test('min + max', () => {
            const args = factory(1,2,u)
            const [str,vals ,count]= sql(args)
            expect(str).toBe(`WHERE num_employees BETWEEN $1 AND $2`)
            expect(vals).toEqual([1,2])
            expect(count).toBeTruthy()
        })
        test('min + name', () => {
            const args = factory(1,u,'h')
            const [str,vals ,count]= sql(args)
            expect(str).toBe(`WHERE name ILIKE $1 AND num_employees >= $2`)
            expect(vals).toEqual(['%h%',1])
            expect(count).toBeTruthy()
        })
        test('max + name', () => {
            const args = factory(u,2,'h')
            const [str,vals ,count]= sql(args)
            expect(str).toBe(`WHERE name ILIKE $1 AND num_employees <= $2`)
            expect(vals).toEqual(['%h%',2])
            expect(count).toBeTruthy()
        })

    })
    describe('all/no filters', () => {
        test('all', () => {
            const args = factory(1,2,'h')
            const [str,vals ,count]= sql(args)
            expect(str).toBe(`WHERE name ILIKE $1 AND num_employees BETWEEN $2 AND $3`)
            expect(vals).toEqual(['%h%',1,2])
            expect(count).toBeTruthy()
        })
        test('none', () => {
            const args = factory(u,u,u)

            expect(sql(args)).toBeNull()

        })
    })
})