import { Container, Postform } from '../components'

export default function AddPost() {
    return (
        <div className="py-10 sm:py-14">
            <Container>
                <header className="mb-8">
                    <p className="font-sans text-xs font-semibold uppercase tracking-wider text-olive-dark">New post</p>
                    <h1 className="mt-1 text-3xl sm:text-4xl">Write a post</h1>
                    <p className="mt-2 text-ink-soft">Save it as a draft to keep it private, or publish it straight away.</p>
                </header>
                <Postform />
            </Container>
        </div>
    )
}
