import sys

from setuptools import setup, find_packages


def forbid(commands=None):
    """Prevent the given sdist commands from being used with this package.

    :param commands Optional list of commands to prohibit. "register" and "upload" by default.
    """
    argv = sys.argv
    if commands is None:
        commands = ["register", "upload"]

    for command in commands:
        if command in argv:
            values = {"command": command}
            print('Command "%(command)s" is not allowed, exiting...' % values)
            sys.exit(2)


forbid()

setup(
    name="gearshift",
    version="1.0.0",
    description="Find anything",
    url="http://gearshift.ai",
    author="Michael Barnathan",
    author_email="michael@gearshift.ai",
    license="Proprietary",
    classifiers=[
        "Development Status :: 5 - Stable",
        "Intended Audience :: Developers",
        "Programming Language :: Python :: 3.7",
    ],
    python_requires=">=3.7",
    packages=find_packages("src"),
    package_dir={"": "src"},
    include_package_data=True,
    entry_points={
        'console_scripts': [
            'gear=gearshift.main:main',
        ],
    },
    test_suite="nose.collector",
    tests_require=["nose", "mypy"],

    install_requires=[
        "evanesca",
        "dropbox",
        "pydash",
        "firebase_admin",
        "attribs",
        "orderedmultidict",
        "mimetypes",
        "arrow",
        "nose",
    ],
)
