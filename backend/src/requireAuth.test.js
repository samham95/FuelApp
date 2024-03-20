const jwt = require('jsonwebtoken');
const requireAuth = require('./requireAuth');
const AppError = require('./AppError');
const { isTokenInvalidated } = require('./loginModule');

//Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('./loginModule');

describe('requireAuth middleware tests', () => {
    let req, res, next;

    beforeEach(() => {
        req = { signedCookies: {}, body: {}, params: {} };
        res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('passes if token valid and username matches', async () => {
        const tkn = 'valid_tkn'; //mock valid token
        const decoded = { username: 'mock_user' }; 
        req.signedCookies.auth_token = tkn;
        req.params.username = 'mock_user';

        jwt.verify.mockReturnValue(decoded);
        isTokenInvalidated.mockResolvedValue(false);

        await requireAuth(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    test('returns 401 if token missing', async () => {
        await requireAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith('Authentication required');
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 401 if token invalidated', async () => {
        const tkn = 'inval_tkn';
        req.signedCookies.auth_token = tkn;

        isTokenInvalidated.mockResolvedValue(true);

        await requireAuth( req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith('Token has already been invalidated');
        expect(next).not.toHaveBeenCalled();
    }); 

    test('401 returned if username not a match with decoded username', async () => {
        const tkn = 'val_tkn';
        const decoded = { username: 'dec_user' };
        req.signedCookies.auth_token = tkn;
        req.params.username = 'diff_user'

        jwt.verify.mockReturnValue(decoded);
        isTokenInvalidated.mockResolvedValue(false);

        await requireAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith('Invalid user token: diff_user');
        expect(next).not.toHaveBeenCalled();
    })

    test('returns 401 if jwt.verify throws error', async () => {
        req.signedCookies.auth_token = 'invalid_tkn';

        const error = new Error('Invalid or expired token');
        jwt.verify.mockImplementation(() => {
            throw error;
        });

        await requireAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith('Invalid or expired token');
        expect(next).not.toHaveBeenCalled();
    });

    test('401 returned if isTokenInvalidated throws an error', async () => {
        const tkn = 'valid_tkn';
        const decoded = { username: 'mock_user' };
        req.signedCookies.auth_token = tkn;

        jwt.verify.mockReturnValue(decoded);
        isTokenInvalidated.mockRejectedValue(new Error());

        await requireAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith('Invalid or expired token');
        expect(next).not.toHaveBeenCalled();
    });
});