from contextlib import contextmanager

from sqlalchemy import exc


@contextmanager
def nested_session(session):
    try:
        sess = session.begin_nested()
        yield sess
        sess.rollback()
    except AssertionError as err:
        raise err
    except exc.ResourceClosedError:
        # means the close out of the transaction got fouled in pytest
        pass
    finally:
        pass
