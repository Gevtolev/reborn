import pytest
from app.services.sms import SMSService


@pytest.fixture
def sms_service():
    return SMSService()


def test_generate_code_length(sms_service):
    code = sms_service.generate_code()
    assert len(code) == 6
    assert code.isdigit()


def test_generate_code_randomness(sms_service):
    codes = {sms_service.generate_code() for _ in range(100)}
    assert len(codes) > 90  # Should be mostly unique
