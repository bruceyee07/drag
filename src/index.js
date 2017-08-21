import React from 'react'
import ReactDOM from 'react-dom'
import cx from 'classnames'
import './style.styl'

const containerMap = {}

function inReact (point, rectPoints) {

  const reactXs = rectPoints.map(point => point.x)
  const reactYs = rectPoints.map(point => point.y)

  return point.x > Math.min.apply(null, reactXs) &&
    point.x < Math.max.apply(null, reactXs) &&
    point.y > Math.min.apply(null, reactYs) &&
    point.y < Math.max.apply(null, reactYs)
}

class DragItem extends React.Component {
  constructor (props) {
    super(props)
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.drager
  }

  onMouseDown (event) {
    const {className, dragingClassName, disabled} = this.props
    const origin = this.refs.drag

    if (!origin) return
    if (this.drager) return
    if (disabled) return

    const drager = this.drager = document.createElement('div')
    const rect = origin.getBoundingClientRect()

    drager.clientOffsetWidth = event.clientX - rect.left
    drager.clientOffsetHeight = event.clientY - rect.top

    drager.className =  className + ' ' + dragingClassName
    drager.innerHTML = origin.innerHTML
    drager.style.position = 'fixed'
    drager.style.width = origin.offsetWidth + 'px'
    drager.style.height = origin.offsetHeight + 'px'
    drager.style.left = rect.left + 'px'
    drager.style.top = rect.top + 'px'

    document.body.appendChild(drager)
  }

  onMouseMove () {
    const drager = this.drager
    if (!drager) return
    drager.style.left = event.clientX - drager.clientOffsetWidth + 'px'
    drager.style.top = event.clientY - drager.clientOffsetHeight + 'px'
  }

  onMouseUp () {
    if (!this.drager) return

    let receiver
    for (let containerKey in containerMap) {

      if (this.props.containerKeys.indexOf(containerKey) === -1) continue

      const container = containerMap[containerKey]
      let containerRect      
      if (
        container && container.getBoundingClientRect &&
        (containerRect = container.getBoundingClientRect())
      ) {
        const dragerReact = this.drager.getBoundingClientRect()
        const dragerReactPoint = {
          x: (dragerReact.left + dragerReact.right) / 2,
          y: (dragerReact.top + dragerReact.bottom) / 2
        }
        const containerReactPoints = [
          {x: containerRect.left, y: containerRect.top},
          {x: containerRect.right, y: containerRect.top},
          {x: containerRect.right, y: containerRect.bottom},
          {x: containerRect.left, y: containerRect.bottom}
        ]
        if (inReact(dragerReactPoint, containerReactPoints)) {
          receiver = container
          break
        }
      }
    }

    this.drager.parentNode.removeChild(this.drager)
    this.drager = undefined

    if (receiver && receiver.receiveDrag) {
      receiver.receiveDrag(this.props.data)
    }
  }

  componentDidMount () {
    document.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('mouseup', this.onMouseUp)
  }

  componentWillUnmount () {
    document.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('mouseup', this.onMouseUp)
  }

  render () {
    const {children, className} = this.props
    return <div
      ref="drag"
      onMouseDown={this.onMouseDown}
      className={cx(className, {'disable-drag' : this.props.disabled})}>{children}</div>
  }
}

class DragContainer extends React.Component {
  receiveDrag (data) {
    this.props.receiveDrag(data)
  }
  getBoundingClientRect () {
    return this.refs.container && this.refs.container.getBoundingClientRect()
  }
  componentDidMount () {
    containerMap[this.props.containerKey] = this
  }
  componentWillUnmount () {
     delete containerMap[this.props.containerKey]
  }
  render () {
    const {children, className} = this.props
    return <div ref='container' className={className}>{children}</div>
  }
}

class Drag extends React.Component {
  constructor (props) {
    super(props)
    this.state = { receivedList: [] }
    this.receiveDrag = data => {
      if (this.state.receivedList.indexOf(data) >= 0) return
      const receivedList = this.state.receivedList.concat(data)
      this.setState({ receivedList })
    }
  }
  render () {
    const list = [
      {name: 'aaaaaaaa', code: '1'},
      {name: 'bbbbbbbb', code: '2'},
      {name: 'cccccccc', code: '3'},
      {name: 'dddddddd', code: '4'},
      {name: 'eeeeeeee', code: '5'},
      {name: 'ffffffff', code: '6'},
      {name: 'gggggggg', code: '7'},
      {name: 'hhhhhhhh', code: '8'}
    ]
    return <div>
      <ul>{list.map((item, index) =>
        <li key={index}>
          <DragItem
            className="drag-item"
            dragingClassName="drag-item-draging"
            containerKeys={['container1']}
            data={item.code}
            disabled={(() => { return false })()}
          >
            {item.name}
          </DragItem>
        </li>
      )}</ul>

      <DragContainer
        className="drag-container"
        containerKey="container1"
        receiveDrag={this.receiveDrag}
      >
        {this.state.receivedList.map((code, index) => {
          const item = list.filter(item => item.code === code)[0]
          return <span key={index} className="drag-container-item">{item.name}</span>
        })}
      </DragContainer>
    </div>
  }
}

ReactDOM.render(
  <Drag />,
  document.getElementById('root')
)