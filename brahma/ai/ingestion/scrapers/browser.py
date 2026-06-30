"""
Shared headless browser utility for all BRAHMA scrapers.
Uses true headless Chromium — no visible window, no taskbar icon.
Session warming visits Google first to reduce bot-detection risk.
"""
import os
import time
import random
import re
from contextlib import contextmanager
from playwright.sync_api import sync_playwright

CHROMIUM_PATH = "/usr/bin/chromium-browser"

def _is_captcha(html: str) -> bool:
    title = re.search(r"<title>(.*?)</title>", html, re.IGNORECASE)
    if title:
        t = title.group(1).lower()
        return "recaptcha" in t or "checking your browser" in t
    return False


@contextmanager
def get_browser():
    """Context manager yielding (browser, context) with stealth settings."""
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=CHROMIUM_PATH,
            headless=True,          # True headless — no window, no taskbar icon
            args=[
                "--no-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--disable-setuid-sandbox",
                "--no-first-run",
                "--no-zygote",
                "--single-process",
            ],
        )
        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1920, "height": 1080},
            locale="en-US",
            java_script_enabled=True,
        )
        context.add_init_script(
            "Object.defineProperty(navigator,'webdriver',{get:()=>undefined})"
        )
        try:
            yield browser, context
        finally:
            browser.close()


def _warm_session(page) -> None:
    """Visit Google briefly to establish a real-looking session."""
    try:
        page.goto(
            "https://www.google.com",
            wait_until="domcontentloaded",
            timeout=15000,
        )
        time.sleep(random.uniform(1.5, 2.5))
    except Exception:
        pass


def fetch_page(url: str, wait: float = 3.0) -> str:
    """
    Fetch a URL using true headless Chromium.
    No visible window. No taskbar icon. No Xvfb needed.
    Warms session via Google first to reduce CAPTCHA risk.
    Returns HTML string, or "" on failure.
    """
    with get_browser() as (browser, context):
        page = context.new_page()
        _warm_session(page)

        try:
            page.goto(url, wait_until="networkidle", timeout=30000)
            time.sleep(wait + random.uniform(1.0, 2.0))
            html = page.content()

            if not _is_captcha(html):
                return html

            print(f"[BROWSER] CAPTCHA detected on {url}, waiting 20s...")
            time.sleep(20)
            page.reload(wait_until="networkidle", timeout=30000)
            time.sleep(5)
            html = page.content()

            if _is_captcha(html):
                print(f"[BROWSER] CAPTCHA persists — skipping {url}")
                return ""
            return html

        except Exception as e:
            print(f"[BROWSER] Error fetching {url}: {e}")
            return ""


def polite_sleep() -> None:
    time.sleep(random.uniform(2.0, 4.0))
