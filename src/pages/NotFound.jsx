import { Container, NotFoundState } from '../components'

export default function NotFound() {
    return (
        <Container width="narrow">
            <NotFoundState title="Page not found" message="The address you followed does not match anything on this site." />
        </Container>
    )
}
